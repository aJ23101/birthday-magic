import { createClient } from '@supabase/supabase-js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!token) return Response.json({ error: 'Please sign in to send this email.' }, { status: 401 });
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return Response.json({ error: 'Email sending is not configured on this server.' }, { status: 503 });
  }
  if (!resendApiKey || !fromEmail) {
    return Response.json({ error: 'Email delivery is not configured yet.' }, { status: 503 });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
  }

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
  if (typeof body !== 'object' || body === null || !('recipientEmail' in body) || typeof body.recipientEmail !== 'string') {
    return Response.json({ error: 'Enter a valid recipient email address.' }, { status: 400 });
  }
  const recipientEmail = body.recipientEmail.trim();
  if (!EMAIL_PATTERN.test(recipientEmail) || recipientEmail.length > 254) {
    return Response.json({ error: 'Enter a valid recipient email address.' }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: page, error: pageError } = await admin
    .from('wishes')
    .select('id, slug, recipient_name, user_id, is_published')
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
  const { count, error: limitError } = await admin
    .from('birthday_send_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneMinuteAgo);

  if (limitError) {
    console.error('Email share rate limit check failed:', limitError);
    return Response.json({ error: 'We could not prepare your email. Please try again.' }, { status: 500 });
  }
  if ((count || 0) >= 5) {
    return Response.json({ error: 'Please wait a minute before sending more birthday emails.' }, { status: 429 });
  }

  const { data: event, error: eventError } = await admin
    .from('birthday_send_events')
    .insert({
      user_id: user.id,
      birthday_page_id: page.id,
      channel: 'email',
      recipient_email: recipientEmail,
      status: 'pending',
    })
    .select('id')
    .single();

  if (eventError || !event) {
    console.error('Could not record birthday email attempt:', eventError);
    return Response.json({ error: 'We could not record this email request. Please try again.' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const shareUrl = `${appUrl.replace(/\/$/, '')}/w/${encodeURIComponent(page.slug)}`;
  let providerResponse: Response;
  try {
    providerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: `A birthday surprise for ${page.recipient_name}`,
        text: `Hi ${page.recipient_name},\n\nSomeone made a birthday surprise just for you!\n\nOpen it here: ${shareUrl}\n\nMade with BirthdayMagic`,
      }),
    });
  } catch (providerError) {
    console.error('Birthday email provider request failed:', providerError);
    const { error: updateError } = await admin
      .from('birthday_send_events')
      .update({ status: 'failed', error_message: 'Email provider request failed', updated_at: new Date().toISOString() })
      .eq('id', event.id);
    if (updateError) console.error('Could not record failed birthday email:', updateError);
    return Response.json({ error: 'The email could not be submitted. Please try again.' }, { status: 502 });
  }

  const providerPayload: unknown = await providerResponse.json().catch(() => ({}));
  if (!providerResponse.ok) {
    const providerMessage =
      typeof providerPayload === 'object' && providerPayload !== null && 'message' in providerPayload &&
      typeof providerPayload.message === 'string'
        ? providerPayload.message
        : 'Email provider rejected the request';
    const { error: updateError } = await admin
      .from('birthday_send_events')
      .update({ status: 'failed', error_message: providerMessage, updated_at: new Date().toISOString() })
      .eq('id', event.id);
    if (updateError) console.error('Could not record rejected birthday email:', updateError);
    return Response.json({ error: 'The email provider did not accept this email.' }, { status: 502 });
  }

  const providerMessageId =
    typeof providerPayload === 'object' && providerPayload !== null && 'id' in providerPayload &&
    typeof providerPayload.id === 'string'
      ? providerPayload.id
      : null;
  const { error: acceptanceError } = await admin
    .from('birthday_send_events')
    .update({
      status: 'accepted',
      provider_message_id: providerMessageId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', event.id);

  if (acceptanceError) {
    console.error('Provider accepted email but acceptance could not be recorded:', acceptanceError);
    return Response.json({ error: 'The provider accepted the email, but we could not update its history.' }, { status: 500 });
  }

  return Response.json({ accepted: true });
}
