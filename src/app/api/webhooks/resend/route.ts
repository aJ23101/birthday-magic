import { createHmac, timingSafeEqual } from 'node:crypto';
import { createEmailAdminClient } from '@/lib/birthday-email-server';

function isValidSignature(secret: string, id: string, timestamp: string, body: string, signatureHeader: string): boolean {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300) return false;
  const encodedSecret = secret.replace(/^whsec_/, '');
  let key: Buffer;
  try {
    key = Buffer.from(encodedSecret, 'base64');
  } catch {
    return false;
  }
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
  return signatureHeader.split(' ').some((candidate) => {
    const [version, value] = candidate.split(',', 2);
    if (version !== 'v1' || !value) return false;
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(value);
    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  });
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'Webhook verification is not configured.' }, { status: 503 });

  const id = request.headers.get('svix-id') || '';
  const timestamp = request.headers.get('svix-timestamp') || '';
  const signature = request.headers.get('svix-signature') || '';
  const body = await request.text();
  if (!id || !timestamp || !signature || !isValidSignature(secret, id, timestamp, body, signature)) {
    return Response.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(body);
  } catch {
    return Response.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
  if (
    typeof event !== 'object' ||
    event === null ||
    !('type' in event) ||
    !('data' in event) ||
    typeof event.data !== 'object' ||
    event.data === null ||
    !('email_id' in event.data) ||
    typeof event.data.email_id !== 'string'
  ) {
    return Response.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  const status = event.type === 'email.delivered'
    ? 'delivered'
    : event.type === 'email.bounced'
      ? 'bounced'
      : null;
  if (!status) return Response.json({ received: true, ignored: true });

  const admin = createEmailAdminClient();
  const { data, error } = await admin.rpc('record_birthday_email_delivery', {
    p_provider_message_id: event.data.email_id,
    p_status: status,
  });
  if (error) {
    console.error('Could not record Resend delivery webhook:', error);
    return Response.json({ error: 'Could not record delivery status.' }, { status: 500 });
  }
  return Response.json({ received: true, updatedAttempts: data });
}
