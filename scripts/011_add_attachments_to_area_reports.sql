-- Add attachments column to area_reports table
ALTER TABLE public.area_reports 
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN public.area_reports.attachments IS 'Array of attachment objects with id, name, url, and type';
