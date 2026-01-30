-- Make content column optional in area_reports table
ALTER TABLE public.area_reports ALTER COLUMN content DROP NOT NULL;
