
-- Allow users to update their own user_subjects rows (for topic_progress)
CREATE POLICY "Users can update own subjects"
ON public.user_subjects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
