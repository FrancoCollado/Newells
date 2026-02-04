-- 1. Add attachments column to matches
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- 2. Create storage bucket for match attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('match_attachments', 'match_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up storage policies for match_attachments
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload match attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'match_attachments');

-- Allow public access to view files (or authenticated)
CREATE POLICY "Anyone can view match attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'match_attachments');

-- Allow users to update their own files
CREATE POLICY "Users can update their own match attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'match_attachments' AND owner = auth.uid())
WITH CHECK (bucket_id = 'match_attachments' AND owner = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own match attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'match_attachments' AND owner = auth.uid());

-- 4. Update matches policies to allow editing
-- Drop existing policies if they conflict or are insufficient
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.matches;

-- Create policy to allow creators to update their matches
CREATE POLICY "Creators can update their matches"
ON public.matches FOR UPDATE
TO authenticated
USING (true) -- Temporarily allow all authenticated to try to update, logic should be handled by app or stricter RLS
WITH CHECK (true);

-- NOTE: Ideally, we should check if the user is the creator. 
-- However, the `matches` table stores `created_by` as text (username/name) not UUID.
-- If we want stricter control, we should rely on the application layer or update `created_by` to be UUID.
-- For now, consistent with `trainings`, we'll allow authenticated updates and rely on app checks.

-- 5. Add update policy for match_players
CREATE POLICY "Authenticated users can update match_players"
ON public.match_players FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert match_players"
ON public.match_players FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete match_players"
ON public.match_players FOR DELETE
TO authenticated
USING (true);
