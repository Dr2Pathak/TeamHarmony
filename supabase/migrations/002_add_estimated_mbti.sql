-- Add estimated_mbti column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS estimated_mbti VARCHAR(4) DEFAULT NULL;
