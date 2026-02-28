
-- Add topic_progress column to user_subjects to store per-user topic status overrides
ALTER TABLE public.user_subjects ADD COLUMN topic_progress jsonb NOT NULL DEFAULT '{}'::jsonb;

-- This stores per-user topic completion: { "t1": "completed", "t3": "completed" }
-- When rendering, we merge this with the base subject topics
