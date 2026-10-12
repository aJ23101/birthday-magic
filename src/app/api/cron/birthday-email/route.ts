import { createEmailAdminClient, deliverClaimedBirthdayEmail } from '@/lib/birthday-email-server';

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: 'Cron authorization is not configured.' }, { status: 503 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY || !(process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL)) {
    return Response.json({ error: 'Email delivery is not configured.' }, { status: 503 });
  }

  const admin = createEmailAdminClient();
  const { data: jobs, error } = await admin.rpc('claim_birthday_email_jobs', {
    p_job_id: null,
    p_limit: 15,
  });
  if (error) {
    console.error('Could not claim scheduled birthday emails:', error);
    return Response.json({ error: 'Could not load due birthday emails.' }, { status: 500 });
  }

  let accepted = 0;
  let failedOrRetrying = 0;
  for (const job of jobs || []) {
    try {
      const result = await deliverClaimedBirthdayEmail(
        admin,
        job,
        process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin,
      );
      if (result.status === 'accepted') accepted += 1;
      else failedOrRetrying += 1;
    } catch (deliveryError) {
      console.error(`Scheduled birthday email ${job.id} could not finish:`, deliveryError);
      failedOrRetrying += 1;
    }
  }
  return Response.json({ claimed: jobs?.length || 0, accepted, failedOrRetrying });
}
