import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type EmailJob = {
  id: string;
  user_id: string;
  birthday_page_id: string;
  recipient_email: string;
  sender_display_name: string;
  scheduled_at: string;
  timezone: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  idempotency_key: string;
};

type BirthdayPage = {
  id: string;
  slug: string;
  recipient_name: string;
  sender_name: string;
  main_message: string;
  greeting_header: string | null;
  user_id: string | null;
  is_published: boolean;
};

export function createEmailAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Email sending is not configured on this server.');
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

function configuredSenderAddress(): string {
  const configured = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;
  if (!configured || /[\r\n]/.test(configured)) {
    throw new Error('Set EMAIL_FROM to BirthdayMagic’s verified sending address.');
  }
  const address = configured.match(/<\s*([^<>\s]+)\s*>/)?.[1] || configured.trim();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)) {
    throw new Error('EMAIL_FROM must contain a valid verified email address.');
  }
  return address;
}

function normalizeDisplayName(value: string): string {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, ' ')
    .replace(/[<>\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

export function senderHeader(displayName: string): string {
  const safeDisplayName = normalizeDisplayName(displayName);
  const name = `${safeDisplayName || 'A birthday friend'} via BirthdayMagic`;
  const quoted = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${quoted}" <${configuredSenderAddress()}>`;
}

export function emailMarkup(page: BirthdayPage, sender: string, url: string): { html: string; text: string } {
  const recipient = escapeHtml(page.recipient_name);
  const safeSender = escapeHtml(sender);
  const greeting = escapeHtml(page.greeting_header || `Happy Birthday, ${page.recipient_name}!`);
  const message = escapeHtml(page.main_message).replace(/\r\n|\r|\n/g, '<br>');
  const safeUrl = escapeHtml(url);
  return {
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${greeting}</title></head>
<body style="margin:0;background:#fff7f5;font-family:Arial,Helvetica,sans-serif;color:#312b36">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7f5;padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border:1px solid #f9d9df;border-radius:24px;overflow:hidden">
      <tr><td style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#f43f5e,#fb7185 60%,#fbbf24);color:#ffffff"><div style="font-size:34px">🎂 🎉 🎁</div><p style="margin:10px 0 0;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">A birthday surprise for ${recipient}</p></td></tr>
      <tr><td style="padding:32px 32px 12px"><p style="margin:0 0 16px;font-size:16px">Hi ${recipient},</p><h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:#be123c">${greeting}</h1><p style="margin:0;font-size:16px;line-height:1.75;white-space:normal">${message}</p><p style="margin:24px 0 0;font-size:15px">With love,<br><strong>${safeSender}</strong></p></td></tr>
      <tr><td align="center" style="padding:24px 24px 32px"><a href="${safeUrl}" style="display:inline-block;padding:15px 26px;border-radius:14px;background:#e11d48;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold">Open your birthday surprise</a><p style="margin:18px 0 0;font-size:12px;color:#786f7b">Made with love by BirthdayMagic</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    text: `Hi ${page.recipient_name},\n\n${page.greeting_header || `Happy Birthday, ${page.recipient_name}!`}\n\n${page.main_message}\n\nWith love,\n${sender}\n\nOpen your birthday surprise: ${url}\n\nMade with love by BirthdayMagic`,
  };
}

type ProviderOutcome = { status: 'accepted' | 'retrying' | 'failed'; retryAt?: string };

export async function deliverClaimedBirthdayEmail(
  admin: SupabaseClient,
  job: EmailJob,
  appUrl: string,
): Promise<ProviderOutcome> {
  const { data: page, error: pageError } = await admin
    .from('wishes')
    .select('id, slug, recipient_name, sender_name, main_message, greeting_header, user_id, is_published')
    .eq('id', job.birthday_page_id)
    .eq('user_id', job.user_id)
    .maybeSingle();
  if (pageError) throw pageError;
  if (!page || !page.is_published) {
    return recordFailedAttempt(admin, job, null, 'The birthday page is no longer published.');
  }

  const typedPage = page as BirthdayPage;
  const displayName = normalizeDisplayName(job.sender_display_name || typedPage.sender_name || 'A birthday friend') ||
    'A birthday friend';
  const url = `${appUrl.replace(/\/$/, '')}/w/${encodeURIComponent(typedPage.slug)}`;
  const content = emailMarkup(typedPage, displayName, url);
  const subjectText = (typedPage.greeting_header || `A birthday surprise for ${typedPage.recipient_name}`)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Email delivery is not configured on this server.');

  const { data: event, error: eventError } = await admin
    .from('birthday_send_events')
    .insert({
      user_id: job.user_id,
      birthday_page_id: job.birthday_page_id,
      email_job_id: job.id,
      channel: 'email',
      recipient_email: job.recipient_email,
      sender_display_name: displayName,
      status: 'pending',
    })
    .select('id')
    .single();
  if (eventError || !event) throw eventError || new Error('Could not record the email attempt.');

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': job.idempotency_key,
      },
      body: JSON.stringify({
        from: senderHeader(displayName),
        to: [job.recipient_email],
        subject: `${subjectText} — from ${displayName.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()}`,
        html: content.html,
        text: content.text,
      }),
    });
  } catch (error) {
    return recordFailedAttempt(
      admin,
      job,
      event.id,
      error instanceof Error ? error.message : 'Email provider request failed.',
    );
  }

  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : `Email provider returned HTTP ${response.status}.`;
    return recordFailedAttempt(admin, job, event.id, message, response.status === 429 || response.status >= 500);
  }

  const providerMessageId =
    typeof payload === 'object' && payload !== null && 'id' in payload && typeof payload.id === 'string'
      ? payload.id
      : null;
  const { error: acceptanceError } = await admin.rpc('record_birthday_email_acceptance', {
    p_job_id: job.id,
    p_provider_message_id: providerMessageId,
  });
  if (acceptanceError) throw acceptanceError;

  return { status: 'accepted' };
}

async function recordFailedAttempt(
  admin: SupabaseClient,
  job: EmailJob,
  eventId: string | null,
  reason: string,
  retryable = true,
): Promise<ProviderOutcome> {
  const now = new Date();
  const willRetry = retryable && job.attempt_count < job.max_attempts;
  const retryAt = willRetry
    ? new Date(now.getTime() + Math.min(60, 2 ** job.attempt_count) * 60_000).toISOString()
    : undefined;
  const message = reason.slice(0, 1000);

  if (eventId) {
    const { error } = await admin
      .from('birthday_send_events')
      .update({ status: 'failed', error_message: message, updated_at: now.toISOString() })
      .eq('email_job_id', job.id)
      .eq('status', 'pending');
    if (error) throw error;
  }

  const { error } = await admin
    .from('birthday_email_jobs')
    .update({
      status: willRetry ? 'scheduled' : 'failed',
      scheduled_at: retryAt || job.scheduled_at,
      last_error: message,
      updated_at: now.toISOString(),
      completed_at: willRetry ? null : now.toISOString(),
      processing_started_at: null,
    })
    .eq('id', job.id)
    .eq('status', 'processing');
  if (error) throw error;
  return willRetry ? { status: 'retrying', retryAt } : { status: 'failed' };
}
