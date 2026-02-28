
-- ============================================================
-- 1. SUBJECTS — master catalogue (hardcoded rows)
-- ============================================================
CREATE TABLE public.subjects (
  id TEXT PRIMARY KEY,              -- short key like "math", "bio"
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'purple',  -- "purple" | "green"
  display_order INT NOT NULL DEFAULT 0,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb   -- array of {id, name, status, sessions[]}
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can read the catalogue
CREATE POLICY "Subjects are publicly readable"
  ON public.subjects FOR SELECT
  USING (true);

-- Seed the five default subjects
INSERT INTO public.subjects (id, name, icon, color, display_order, topics) VALUES
('math', 'Mathematics', '📐', 'purple', 1,
 '[{"id":"t1","name":"Numbers & Operations","status":"unlocked","sessions":[]},{"id":"t2","name":"Algebra","status":"locked","sessions":[]},{"id":"t3","name":"Linear Equations","status":"locked","sessions":[]},{"id":"t4","name":"Quadratic Functions","status":"locked","sessions":[]},{"id":"t5","name":"Geometry","status":"locked","sessions":[]},{"id":"t6","name":"Trigonometry","status":"locked","sessions":[]},{"id":"t7","name":"Statistics","status":"locked","sessions":[]},{"id":"t8","name":"Probability","status":"locked","sessions":[]}]'::jsonb),
('bio', 'Biology', '🧬', 'green', 2,
 '[{"id":"bt1","name":"Cell Biology","status":"unlocked","sessions":[]},{"id":"bt2","name":"Genetics","status":"locked","sessions":[]},{"id":"bt3","name":"Evolution","status":"locked","sessions":[]}]'::jsonb),
('eng', 'English Literature', '📚', 'purple', 3,
 '[{"id":"et1","name":"Poetry Analysis","status":"unlocked","sessions":[]},{"id":"et2","name":"Shakespeare","status":"locked","sessions":[]}]'::jsonb),
('phys', 'Physics', '⚡', 'green', 4,
 '[{"id":"pt1","name":"Mechanics","status":"unlocked","sessions":[]},{"id":"pt2","name":"Thermodynamics","status":"locked","sessions":[]},{"id":"pt3","name":"Waves & Optics","status":"locked","sessions":[]}]'::jsonb),
('hist', 'History', '🏛️', 'purple', 5,
 '[{"id":"ht1","name":"Ancient Civilizations","status":"unlocked","sessions":[]},{"id":"ht2","name":"Medieval Period","status":"locked","sessions":[]}]'::jsonb),
('chem', 'Chemistry', '🧪', 'green', 6,
 '[{"id":"ch1","name":"Atomic Structure","status":"unlocked","sessions":[]},{"id":"ch2","name":"Chemical Bonds","status":"locked","sessions":[]},{"id":"ch3","name":"Organic Chemistry","status":"locked","sessions":[]}]'::jsonb),
('geo', 'Geography', '🌍', 'purple', 7,
 '[{"id":"ge1","name":"Physical Geography","status":"unlocked","sessions":[]},{"id":"ge2","name":"Human Geography","status":"locked","sessions":[]}]'::jsonb),
('art', 'Art', '🎨', 'green', 8,
 '[{"id":"ar1","name":"Art History","status":"unlocked","sessions":[]},{"id":"ar2","name":"Drawing Techniques","status":"locked","sessions":[]}]'::jsonb);

-- ============================================================
-- 2. USER_SUBJECTS — which subjects each user picked
-- ============================================================
CREATE TABLE public.user_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subjects"
  ON public.user_subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects"
  ON public.user_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects"
  ON public.user_subjects FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 3. NOTES
-- ============================================================
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'purple',
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notes"
  ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. CHAT_MESSAGES
-- ============================================================
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id TEXT,                          -- optional: which topic this chat is about
  role TEXT NOT NULL DEFAULT 'student',   -- 'student' | 'ai'
  content TEXT NOT NULL DEFAULT '',
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'chart' | 'quiz' | 'callout' | 'code' | 'steps'
  metadata JSONB DEFAULT '{}'::jsonb,       -- chartData, quizData, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages"
  ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
