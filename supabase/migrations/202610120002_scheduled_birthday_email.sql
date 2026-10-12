ALTER TABLE public.birthday_send_events
  ADD COLUMN IF NOT EXISTS email_job_id UUID,
  ADD COLUMN IF NOT EXISTS sender_display_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT
    CHECK (delivery_status IN ('delivered', 'bounced'));

CREATE TABLE IF NOT EXISTS public.birthday_email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birthday_page_id UUID NOT NULL REFERENCES public.wishes(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  sender_display_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'processing', 'accepted', 'delivered', 'failed', 'cancelled')),
  delivery_status TEXT CHECK (delivery_status IN ('delivered', 'bounced')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
  idempotency_key UUID NOT NULL DEFAULT gen_random_uuid(),
  processing_started_at TIMESTAMPTZ,
  provider_message_id TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (idempotency_key)
);

ALTER TABLE public.birthday_send_events
  ADD CONSTRAINT birthday_send_events_email_job_id_fkey
  FOREIGN KEY (email_job_id) REFERENCES public.birthday_email_jobs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_birthday_email_jobs_due
  ON public.birthday_email_jobs (scheduled_at, created_at)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_birthday_email_jobs_user
  ON public.birthday_email_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birthday_email_jobs_page
  ON public.birthday_email_jobs (birthday_page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birthday_send_events_job
  ON public.birthday_send_events (email_job_id, created_at);
CREATE INDEX IF NOT EXISTS idx_birthday_send_events_provider
  ON public.birthday_send_events (provider_message_id)
  WHERE provider_message_id IS NOT NULL;

ALTER TABLE public.birthday_email_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own scheduled birthday emails" ON public.birthday_email_jobs;
CREATE POLICY "Users read their own scheduled birthday emails"
  ON public.birthday_email_jobs FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON public.birthday_email_jobs TO authenticated;
GRANT ALL ON public.birthday_email_jobs TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.birthday_email_jobs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.birthday_send_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.birthday_send_events TO service_role;

CREATE OR REPLACE FUNCTION public.claim_birthday_email_jobs(
  p_job_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS SETOF public.birthday_email_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT job.id
    FROM public.birthday_email_jobs AS job
    WHERE (p_job_id IS NULL OR job.id = p_job_id)
      AND (
        (job.status = 'scheduled' AND job.scheduled_at <= NOW())
        OR (job.status = 'processing' AND job.processing_started_at < NOW() - INTERVAL '10 minutes')
      )
    ORDER BY job.scheduled_at, job.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 50))
  )
  UPDATE public.birthday_email_jobs AS job
  SET status = 'processing',
      attempt_count = job.attempt_count + 1,
      processing_started_at = NOW(),
      updated_at = NOW()
  FROM due
  WHERE job.id = due.id
  RETURNING job.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_birthday_email_jobs(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_birthday_email_jobs(UUID, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.record_birthday_email_acceptance(
  p_job_id UUID,
  p_provider_message_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_jobs INTEGER := 0;
  current_status TEXT;
  current_message_id TEXT;
  updated_events INTEGER := 0;
BEGIN
  UPDATE public.birthday_email_jobs
  SET status = 'accepted',
      provider_message_id = p_provider_message_id,
      last_error = NULL,
      updated_at = NOW(),
      completed_at = NOW(),
      processing_started_at = NULL
  WHERE id = p_job_id
    AND status = 'processing';
  GET DIAGNOSTICS updated_jobs = ROW_COUNT;

  IF updated_jobs = 0 THEN
    SELECT status, provider_message_id
      INTO current_status, current_message_id
      FROM public.birthday_email_jobs
      WHERE id = p_job_id;
    IF current_status = 'accepted' AND current_message_id IS NOT DISTINCT FROM p_provider_message_id THEN
      RETURN TRUE;
    END IF;
    RAISE EXCEPTION 'Birthday email job is not processing';
  END IF;

  UPDATE public.birthday_send_events
  SET status = 'accepted',
      provider_message_id = p_provider_message_id,
      updated_at = NOW()
  WHERE email_job_id = p_job_id
    AND status = 'pending';
  GET DIAGNOSTICS updated_events = ROW_COUNT;
  IF updated_events = 0 THEN
    RAISE EXCEPTION 'No pending email attempt exists for this job';
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.record_birthday_email_acceptance(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_birthday_email_acceptance(UUID, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.record_birthday_email_delivery(
  p_provider_message_id TEXT,
  p_status TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affected INTEGER := 0;
BEGIN
  IF p_status NOT IN ('delivered', 'bounced') THEN
    RAISE EXCEPTION 'Unsupported email delivery status';
  END IF;

  UPDATE public.birthday_email_jobs
  SET delivery_status = p_status,
      updated_at = NOW(),
      completed_at = COALESCE(completed_at, NOW())
  WHERE provider_message_id = p_provider_message_id
    AND status = 'accepted'
    AND (delivery_status IS DISTINCT FROM 'delivered' OR p_status = 'delivered');

  UPDATE public.birthday_send_events
  SET delivery_status = p_status,
      updated_at = NOW()
  WHERE provider_message_id = p_provider_message_id
    AND status = 'accepted'
    AND (delivery_status IS DISTINCT FROM 'delivered' OR p_status = 'delivered');
  GET DIAGNOSTICS affected = ROW_COUNT;

  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.record_birthday_email_delivery(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_birthday_email_delivery(TEXT, TEXT) TO service_role;
