-- ==========================================================
-- Migration 002: Freelance Teacher Support & Delete Policies
-- ==========================================================

-- 1. Add Teacher & Educator fields to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subjects TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS grades TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS boards TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS qualification VARCHAR(128),
  ADD COLUMN IF NOT EXISTS teaching_mode VARCHAR(64) DEFAULT 'Online 1-on-1',
  ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS demo_video_url TEXT;

-- 2. Add DELETE policies to allow clean-up / purging
DROP POLICY IF EXISTS "Allow delete on profiles" ON public.profiles;
CREATE POLICY "Allow delete on profiles" ON public.profiles FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow delete on projects" ON public.projects;
CREATE POLICY "Allow delete on projects" ON public.projects FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow delete on applications" ON public.applications;
CREATE POLICY "Allow delete on applications" ON public.applications FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow delete on ratings" ON public.ratings;
CREATE POLICY "Allow delete on ratings" ON public.ratings FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow delete on verification_queue" ON public.verification_queue;
CREATE POLICY "Allow delete on verification_queue" ON public.verification_queue FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow delete on reports" ON public.reports;
CREATE POLICY "Allow delete on reports" ON public.reports FOR DELETE USING (true);

-- 3. Update status policy on projects to allow updating all fields
DROP POLICY IF EXISTS "Clients can update own projects" ON public.projects;
CREATE POLICY "Clients can update own projects" ON public.projects FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Fast flush snippet for Supabase SQL Editor:
-- TRUNCATE public.ratings, public.applications, public.projects, public.verification_queue, public.reports CASCADE;
-- DELETE FROM public.profiles;
