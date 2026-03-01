-- TeamStability AI - Database Schema
-- Run this SQL in the Supabase Dashboard SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS table
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(100) DEFAULT '',
  resume_text TEXT DEFAULT '',
  survey_data JSONB DEFAULT '{}',
  audio_transcript TEXT DEFAULT '',
  canonical_profile JSONB DEFAULT NULL,
  personality_stability_score NUMERIC(5,2) DEFAULT NULL,
  personality_confidence_level VARCHAR(20) DEFAULT NULL,
  personality_recommendation TEXT DEFAULT '',
  personality_strengths JSONB DEFAULT '[]',
  personality_weaknesses JSONB DEFAULT '[]',
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEAMS table
-- ============================================
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  confirmed BOOLEAN DEFAULT FALSE,
  team_stability_score NUMERIC(5,2) DEFAULT NULL,
  team_classification VARCHAR(20) DEFAULT NULL,
  team_recommendation TEXT DEFAULT '',
  team_strengths JSONB DEFAULT '[]',
  team_weaknesses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEAM_MEMBERS table
-- ============================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_recommendation TEXT DEFAULT '',
  member_strengths JSONB DEFAULT '[]',
  member_weaknesses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ============================================
-- AGENT_SCORES table
-- ============================================
CREATE TABLE public.agent_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  agent_name VARCHAR(50) NOT NULL,
  score NUMERIC(4,3) NOT NULL,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  explanation TEXT DEFAULT '',
  recommendation VARCHAR(50) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_teams_owner ON public.teams(owner_user_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_agent_scores_team ON public.agent_scores(team_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_scores ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Teams policies
CREATE POLICY "teams_select" ON public.teams
  FOR SELECT USING (
    owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "teams_insert" ON public.teams
  FOR INSERT WITH CHECK (
    owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "teams_update" ON public.teams
  FOR UPDATE USING (
    owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "teams_delete" ON public.teams
  FOR DELETE USING (
    owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Team members policies
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams
      WHERE owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "team_members_insert" ON public.team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams
      WHERE owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "team_members_delete" ON public.team_members
  FOR DELETE USING (
    team_id IN (
      SELECT id FROM public.teams
      WHERE owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- Agent scores policies
CREATE POLICY "agent_scores_select" ON public.agent_scores
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams
      WHERE owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    OR team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "agent_scores_insert" ON public.agent_scores
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams
      WHERE owner_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORAGE BUCKET for file uploads
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
