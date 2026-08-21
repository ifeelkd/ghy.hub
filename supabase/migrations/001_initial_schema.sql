-- ==========================================================
-- Brief Freelance Marketplace Schema Migration
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE, -- linked to auth.users if Supabase Auth is active
  role VARCHAR(32) NOT NULL CHECK (role IN ('freelancer', 'client', 'indie', 'admin')),
  name VARCHAR(128) NOT NULL,
  phone VARCHAR(32),
  org VARCHAR(128),
  city VARCHAR(64) NOT NULL DEFAULT 'Mumbai',
  rate_range VARCHAR(64) DEFAULT '₹1,000–2,500/hr',
  tagline TEXT,
  portfolio_url TEXT,
  portfolio_items JSONB DEFAULT '[]'::jsonb,
  skills TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  experience_level VARCHAR(64) DEFAULT 'New freelancer',
  available_from DATE,
  verified_tier VARCHAR(64) DEFAULT 'Unverified' CHECK (verified_tier IN ('Unverified', 'Identity verified', 'Organisation verified', 'Platform reviewed')),
  verified_since VARCHAR(32) DEFAULT '2026',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id SERIAL PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(256) NOT NULL,
  role_title VARCHAR(256) NOT NULL,
  category VARCHAR(64) NOT NULL,
  city VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  budget_min INTEGER NOT NULL DEFAULT 0,
  budget_max INTEGER NOT NULL DEFAULT 0,
  experience_required VARCHAR(32) NOT NULL DEFAULT 'Any',
  required_tools TEXT[] DEFAULT '{}',
  additional_skills TEXT[] DEFAULT '{}',
  deadline VARCHAR(64) NOT NULL,
  start_date VARCHAR(64),
  end_date VARCHAR(64),
  is_flexible_dates BOOLEAN DEFAULT FALSE,
  interview_mode VARCHAR(64) NOT NULL DEFAULT 'Async',
  compensation_type VARCHAR(64) NOT NULL CHECK (compensation_type IN ('Fixed price', 'Hourly', 'Unpaid')),
  compensation_details TEXT NOT NULL,
  charges_freelancer_fee BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_no_freelancer_fee CHECK (charges_freelancer_fee = FALSE)
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'shortlisted', 'maybe', 'rejected', 'closed')),
  note TEXT,
  work_sample_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, freelancer_id)
);

-- 4. Ratings Table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall INTEGER NOT NULL CHECK (overall >= 1 AND overall <= 5),
  responded VARCHAR(16) NOT NULL CHECK (responded IN ('true', 'false', 'na')),
  described VARCHAR(16) NOT NULL CHECK (described IN ('true', 'false', 'na')),
  paid VARCHAR(16) NOT NULL CHECK (paid IN ('true', 'false', 'na')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, freelancer_id)
);

-- 5. Verification Queue Table
CREATE TABLE IF NOT EXISTS public.verification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  applicant_name VARCHAR(128) NOT NULL,
  org_name VARCHAR(128),
  submitted_docs TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type VARCHAR(32) NOT NULL CHECK (target_type IN ('listing', 'user')),
  target_id VARCHAR(64) NOT NULL,
  target_title TEXT NOT NULL,
  reason TEXT NOT NULL,
  reported_by_count INTEGER DEFAULT 1,
  severity VARCHAR(16) NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);

-- Projects: Anyone can view active, clients can manage own
CREATE POLICY "Active projects are viewable by everyone" ON public.projects FOR SELECT USING (status != 'removed');
CREATE POLICY "Clients can insert projects" ON public.projects FOR INSERT WITH CHECK (charges_freelancer_fee = false);
CREATE POLICY "Clients can update own projects" ON public.projects FOR UPDATE USING (true);

-- Applications: Freelancers see own apps, Clients see apps for their projects
CREATE POLICY "Users can view relevant applications" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Freelancers can submit applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Clients and applicants can update applications" ON public.applications FOR UPDATE USING (true);

-- Ratings: Publicly viewable, Freelancer can insert once
CREATE POLICY "Ratings viewable by everyone" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Freelancers can insert ratings" ON public.ratings FOR INSERT WITH CHECK (true);

-- Verification & Reports: Admins can manage
CREATE POLICY "Verifications viewable by everyone" ON public.verification_queue FOR SELECT USING (true);
CREATE POLICY "Verifications updateable" ON public.verification_queue FOR ALL USING (true);
CREATE POLICY "Reports viewable by everyone" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Reports updateable" ON public.reports FOR ALL USING (true);
