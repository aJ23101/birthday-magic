-- Happy Birthday Website Generator - Database Schema & Policies
-- Run this script in your Supabase SQL Editor

-- 1. Create table for Birthday Wishes
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Personalization details
    recipient_name TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    relationship TEXT,
    birth_date DATE,
    age INTEGER,
    greeting_header TEXT,
    main_message TEXT NOT NULL,
    secret_note TEXT,

    -- Template and theme styles
    template TEXT NOT NULL DEFAULT 'pastel',
    primary_color TEXT DEFAULT '#ec4899',
    font_style TEXT DEFAULT 'playful',
    background_effect TEXT DEFAULT 'balloons',

    -- JSON content fields
    photos JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    music JSONB DEFAULT '{"trackId":"celebration","trackTitle":"Celebration","enabled":true}'::jsonb,

    -- Feature toggles
    enable_gift_box BOOLEAN DEFAULT true,
    enable_cake BOOLEAN DEFAULT true,
    enable_make_a_wish BOOLEAN DEFAULT true,
    enable_photo_gallery BOOLEAN DEFAULT true,
    enable_timeline BOOLEAN DEFAULT true,
    enable_secret_note BOOLEAN DEFAULT true,
    enable_sound_fx BOOLEAN DEFAULT true
);

-- Index for speedy slug lookup
CREATE INDEX IF NOT EXISTS idx_wishes_slug ON public.wishes(slug);
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON public.wishes(user_id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view published wishes by slug
CREATE POLICY "Public read for published wishes"
ON public.wishes FOR SELECT
USING (is_published = true OR auth.uid() = user_id);

-- Policy 2: Authenticated users can insert their own wishes, or anonymous users can create public gifts
CREATE POLICY "Allow creations"
ON public.wishes FOR INSERT
WITH CHECK (true);

-- Policy 3: Users can update their own wishes or open wishes matching their session
CREATE POLICY "Allow update owner"
ON public.wishes FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy 4: Users can delete their own wishes
CREATE POLICY "Allow delete owner"
ON public.wishes FOR DELETE
USING (auth.uid() = user_id);

-- 3. Storage Buckets for Photos & Audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Access for photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Public Upload for photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Public Access for audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Public Upload for audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio');

-- 4. RPC for incrementing view counts atomically
CREATE OR REPLACE FUNCTION increment_views(wish_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.wishes
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE slug = wish_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
