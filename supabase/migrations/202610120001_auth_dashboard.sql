-- Account-owned birthday creations and provider-accepted email history.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

ALTER TABLE public.wishes
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.wishes
SET published_at = COALESCE(published_at, updated_at, created_at)
WHERE is_published = TRUE AND published_at IS NULL;

CREATE TABLE IF NOT EXISTS public.birthday_send_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birthday_page_id UUID NOT NULL REFERENCES public.wishes(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email')),
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'delivered', 'failed')),
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_birthday_send_events_user_created
  ON public.birthday_send_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birthday_send_events_page
  ON public.birthday_send_events (birthday_page_id);
CREATE INDEX IF NOT EXISTS idx_wishes_user_created
  ON public.wishes (user_id, created_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_send_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are private to their owner" ON public.profiles;
CREATE POLICY "Profiles are private to their owner"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update their own profile" ON public.profiles;
CREATE POLICY "Users update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert their own profile" ON public.profiles;
CREATE POLICY "Users insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users read their own send events" ON public.birthday_send_events;
CREATE POLICY "Users read their own send events"
  ON public.birthday_send_events FOR SELECT
  USING (auth.uid() = user_id);

-- Send events are written only by the server after it verifies Supabase Auth
-- and receives an acceptance response from the email provider.
DROP POLICY IF EXISTS "Users insert their own send events" ON public.birthday_send_events;
DROP POLICY IF EXISTS "Users update their own send events" ON public.birthday_send_events;

DROP POLICY IF EXISTS "Public read for published wishes" ON public.wishes;
CREATE POLICY "Public read for published wishes"
  ON public.wishes FOR SELECT
  USING (is_published = TRUE OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow creations" ON public.wishes;
CREATE POLICY "Authenticated owners create wishes"
  ON public.wishes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "Guests create published wishes"
  ON public.wishes FOR INSERT
  WITH CHECK (auth.uid() IS NULL AND user_id IS NULL AND is_published = TRUE);

DROP POLICY IF EXISTS "Allow update owner" ON public.wishes;
CREATE POLICY "Owners update their wishes"
  ON public.wishes FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow delete owner" ON public.wishes;
CREATE POLICY "Owners delete their wishes"
  ON public.wishes FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.birthday_send_events TO authenticated;
GRANT SELECT ON public.wishes TO anon, authenticated;
GRANT INSERT ON public.wishes TO anon, authenticated;
GRANT UPDATE, DELETE ON public.wishes TO authenticated;
