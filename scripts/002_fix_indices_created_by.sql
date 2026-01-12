-- Update indices table to separate user ID and user name
-- created_by will be used for display (user name)
-- Add user_id for RLS policies

ALTER TABLE indices 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update the RLS policies to use user_id instead of created_by
DROP POLICY IF EXISTS "Allow users to update own indices" ON indices;
DROP POLICY IF EXISTS "Allow users to delete own indices" ON indices;

CREATE POLICY "Allow users to update own indices"
  ON indices FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to delete own indices"
  ON indices FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
