import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createEmailAdminClient } from '@/lib/birthday-email-server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function authenticatedUser(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) return null;
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await auth.auth.getUser(token);
  return error ? null : user;
}

async function ownedJob(request: Request, id: string) {
  const user = await authenticatedUser(request);
  if (!user) return { response: Response.json({ error: 'Please sign in again.' }, { status: 401 }) };
  if (!UUID_PATTERN.test(id)) return { response: Response.json({ error: 'Email job not found.' }, { status: 404 }) };
  const admin = createEmailAdminClient();
  const { data: job, error } = await admin
    .from('birthday_email_jobs')
    .select('id, user_id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('Could not verify birthday email job ownership:', error);
    return { response: Response.json({ error: 'Could not verify this scheduled email.' }, { status: 500 }) };
  }
  if (!job) return { response: Response.json({ error: 'Scheduled email not found.' }, { status: 404 }) };
  return { admin, job, user };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await ownedJob(request, id);
  if (access.response) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'The request was not valid.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || !('action' in body) || typeof body.action !== 'string') {
    return Response.json({ error: 'Choose a valid email action.' }, { status: 400 });
  }

  if (body.action === 'reschedule') {
    if (
      access.job.status !== 'scheduled' ||
      !('scheduledAt' in body) ||
      typeof body.scheduledAt !== 'string' ||
      !Number.isFinite(Date.parse(body.scheduledAt)) ||
      Date.parse(body.scheduledAt) < Date.now() + 30_000 ||
      !('timeZone' in body) ||
      typeof body.timeZone !== 'string'
    ) {
      return Response.json({ error: 'Choose a future delivery time for an email that is still scheduled.' }, { status: 400 });
    }
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: body.timeZone }).format();
    } catch {
      return Response.json({ error: 'Choose a valid time zone.' }, { status: 400 });
    }
    const { data, error } = await access.admin
      .from('birthday_email_jobs')
      .update({
        scheduled_at: new Date(body.scheduledAt).toISOString(),
        timezone: body.timeZone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', access.user.id)
      .eq('status', 'scheduled')
      .select('id, scheduled_at, timezone, status')
      .maybeSingle();
    if (error) {
      console.error('Could not reschedule birthday email:', error);
      return Response.json({ error: 'Could not reschedule this email.' }, { status: 500 });
    }
    if (!data) return Response.json({ error: 'This email is no longer scheduled.' }, { status: 409 });
    return Response.json({ job: data });
  }

  if (body.action === 'retry') {
    if (access.job.status !== 'failed') {
      return Response.json({ error: 'Only failed emails can be retried.' }, { status: 409 });
    }
    const { data, error } = await access.admin
      .from('birthday_email_jobs')
      .update({
        status: 'scheduled',
        scheduled_at: new Date().toISOString(),
        attempt_count: 0,
        idempotency_key: randomUUID(),
        last_error: null,
        completed_at: null,
        processing_started_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', access.user.id)
      .eq('status', 'failed')
      .select('id, scheduled_at, timezone, status')
      .maybeSingle();
    if (error) {
      console.error('Could not retry failed birthday email:', error);
      return Response.json({ error: 'Could not retry this email.' }, { status: 500 });
    }
    if (!data) return Response.json({ error: 'This email is no longer available to retry.' }, { status: 409 });
    return Response.json({ job: data }, { status: 202 });
  }

  return Response.json({ error: 'Choose a valid email action.' }, { status: 400 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await ownedJob(request, id);
  if (access.response) return access.response;
  if (access.job.status !== 'scheduled') {
    return Response.json({ error: 'Only pending scheduled emails can be cancelled.' }, { status: 409 });
  }

  const { data, error } = await access.admin
    .from('birthday_email_jobs')
    .update({ status: 'cancelled', updated_at: new Date().toISOString(), completed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', access.user.id)
    .eq('status', 'scheduled')
    .select('id')
    .maybeSingle();
  if (error) {
    console.error('Could not cancel birthday email:', error);
    return Response.json({ error: 'Could not cancel this scheduled email.' }, { status: 500 });
  }
  if (!data) return Response.json({ error: 'This email is no longer scheduled.' }, { status: 409 });
  return Response.json({ cancelled: true });
}
