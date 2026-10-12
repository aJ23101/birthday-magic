import { createClient } from '@supabase/supabase-js';
import { createEmailAdminClient, deliverClaimedBirthdayEmail } from '@/lib/birthday-email-server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token) return Response.json({ error: 'Please sign in to send or schedule this email.' }, { status: 401 });
  if (!supabaseUrl || !anonKey || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Email sending is not configured on this server.' }, { status: 503 });
  }
  if (!process.env.RESEND_API_KEY || !(process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL)) {
    return Response.json({ error: 'Email delivery is not configured yet.' }, { status: 503 });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return Response.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return Response.json({ error: 'Save this birthday website to your account before emailing it.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'The email request was not valid.' }, { status: 400 });
  }
  if (
    typeof body !== 'object' ||
    body === null ||
    !('recipientEmail' in body) ||
    typeof body.recipientEmail !== 'string'
  ) {
    return Response.json({ error: 'Enter a valid recipient email address.' }, { status: 400 });
  }

  const requestBody = body as Record<string, unknown>;
  const recipientEmail = (requestBody.recipientEmail as string).trim();
  if (!EMAIL_PATTERN.test(recipientEmail) || recipientEmail.length > 254) {
    return Response.json({ error: 'Enter a valid recipient email address.' }, { status: 400 });
  }

  let scheduledAt = new Date().toISOString();
  let timeZone = 'UTC';
  if (requestBody.scheduledAt !== null && requestBody.scheduledAt !== undefined) {
    if (typeof requestBody.scheduledAt !== 'string' || !Number.isFinite(Date.parse(requestBody.scheduledAt))) {
      return Response.json({ error: 'Choose a valid scheduled delivery date and time.' }, { status: 400 });
    }
    if (Date.parse(requestBody.scheduledAt) < Date.now() + 30_000) {
      return Response.json({ error: 'Choose a delivery time at least 30 seconds in the future.' }, { status: 400 });
    }
    scheduledAt = new Date(requestBody.scheduledAt).toISOString();
    if (typeof requestBody.timeZone !== 'string' || requestBody.timeZone.length > 100) {
      return Response.json({ error: 'Choose a valid time zone.' }, { status: 400 });
    }
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: requestBody.timeZone }).format();
      timeZone = requestBody.timeZone;
    } catch {
      return Response.json({ error: 'Choose a valid time zone.' }, { status: 400 });
    }
  }

  const admin = createEmailAdminClient();
  const { data: page, error: pageError } = await admin
    .from('wishes')
    .select('id, user_id, is_published, sender_name')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (pageError) {
    console.error('Email share ownership lookup failed:', pageError);
    return Response.json({ error: 'We could not verify ownership of this birthday website.' }, { status: 500 });
  }
  if (!page) return Response.json({ error: 'Birthday website not found in your account.' }, { status: 404 });
  if (!page.is_published) {
    return Response.json({ error: 'Publish this birthday website before emailing its link.' }, { status: 409 });
  }

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count, error: rateError } = await admin
    .from('birthday_email_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneMinuteAgo);
  if (rateError) {
    console.error('Birthday email rate-limit check failed:', rateError);
    return Response.json({ error: 'We could not prepare your email. Please try again.' }, { status: 500 });
  }
  if ((count || 0) >= 5) {
    return Response.json({ error: 'Please wait a minute before sending more birthday emails.' }, { status: 429 });
  }

  const { data: job, error: insertError } = await admin
    .from('birthday_email_jobs')
    .insert({
      user_id: user.id,
      birthday_page_id: page.id,
      recipient_email: recipientEmail,
      sender_display_name: page.sender_name || 'A birthday friend',
      scheduled_at: scheduledAt,
      timezone: timeZone,
    })
    .select('*')
    .single();
  if (insertError || !job) {
    console.error('Could not create birthday email job:', insertError);
    return Response.json({ error: 'We could not record this email request. Please try again.' }, { status: 500 });
  }

  if (Date.parse(scheduledAt) > Date.now() + 30_000) {
    return Response.json({ scheduled: true, jobId: job.id, scheduledAt, timeZone }, { status: 202 });
  }

  const { data: claimed, error: claimError } = await admin.rpc('claim_birthday_email_jobs', {
    p_job_id: job.id,
    p_limit: 1,
  });
  if (claimError) {
    console.error('Could not claim immediate birthday email job:', claimError);
    return Response.json({ error: 'The email was saved but could not be sent yet. It will be retried automatically.' }, { status: 202 });
  }
  if (!claimed?.length) {
    return Response.json({ scheduled: true, jobId: job.id }, { status: 202 });
  }

  try {
    const outcome = await deliverClaimedBirthdayEmail(admin, claimed[0], process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin);
    if (outcome.status === 'accepted') return Response.json({ accepted: true, jobId: job.id });
    if (outcome.status === 'retrying') {
      return Response.json({ scheduled: true, retryAt: outcome.retryAt, jobId: job.id }, { status: 202 });
    }
    return Response.json({ error: 'The email provider rejected this email. You can retry it from your dashboard.' }, { status: 502 });
  } catch (error) {
    console.error('Birthday email delivery failed unexpectedly:', error);
    return Response.json({ error: 'The email is queued for automatic retry.' }, { status: 202 });
  }
}
