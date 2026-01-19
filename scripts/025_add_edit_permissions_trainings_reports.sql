-- Script 025: Add update permissions for trainings and reports
-- Allow users to edit only their own trainings and reports

-- Drop existing RLS policies on trainings table
DROP POLICY IF EXISTS "trainings_read_policy" ON trainings;
DROP POLICY IF EXISTS "trainings_insert_policy" ON trainings;
DROP POLICY IF EXISTS "trainings_update_policy" ON trainings;
DROP POLICY IF EXISTS "trainings_delete_policy" ON trainings;
DROP POLICY IF EXISTS "trainings_read" ON trainings;
DROP POLICY IF EXISTS "trainings_insert" ON trainings;
DROP POLICY IF EXISTS "trainings_update" ON trainings;
DROP POLICY IF EXISTS "trainings_delete" ON trainings;

-- Create new RLS policies for trainings
CREATE POLICY "trainings_read" ON trainings FOR SELECT USING (true);

CREATE POLICY "trainings_insert" ON trainings FOR INSERT WITH CHECK (
  auth.uid()::text = created_by::text
);

CREATE POLICY "trainings_update" ON trainings FOR UPDATE USING (
  auth.uid()::text = created_by::text
) WITH CHECK (
  auth.uid()::text = created_by::text
);

CREATE POLICY "trainings_delete" ON trainings FOR DELETE USING (
  auth.uid()::text = created_by::text
);

-- Drop existing RLS policies on reports table
DROP POLICY IF EXISTS "reports_read_policy" ON reports;
DROP POLICY IF EXISTS "reports_insert_policy" ON reports;
DROP POLICY IF EXISTS "reports_update_policy" ON reports;
DROP POLICY IF EXISTS "reports_delete_policy" ON reports;
DROP POLICY IF EXISTS "reports_read" ON reports;
DROP POLICY IF EXISTS "reports_insert" ON reports;
DROP POLICY IF EXISTS "reports_update" ON reports;
DROP POLICY IF EXISTS "reports_delete" ON reports;

-- Create new RLS policies for reports
CREATE POLICY "reports_read" ON reports FOR SELECT USING (true);

CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (
  auth.uid()::text = professional_id::text
);

CREATE POLICY "reports_update" ON reports FOR UPDATE USING (
  auth.uid()::text = professional_id::text
) WITH CHECK (
  auth.uid()::text = professional_id::text
);

CREATE POLICY "reports_delete" ON reports FOR DELETE USING (
  auth.uid()::text = professional_id::text
);

COMMIT;
