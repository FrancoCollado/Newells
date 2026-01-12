-- Create indices table for storing all types of indices
CREATE TABLE IF NOT EXISTS indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'GPS', 'RPE', 'PAUTAS_FUERZA', 'DOLOR_MUSCULAR', 'ESTRES', 'SUENO', 'UNIDAD_ARBITRARIA', 'ONDULACIONES'
  subtype VARCHAR(50), -- For GPS: 'CRONICO' or 'AGUDO', For RPE: 'PRE_SESION' or 'POST_SESION'
  observations TEXT,
  file_url TEXT, -- URL to the uploaded file in Supabase Storage
  file_name TEXT, -- Original filename
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by division and type
CREATE INDEX IF NOT EXISTS idx_indices_division ON indices(division);
CREATE INDEX IF NOT EXISTS idx_indices_type ON indices(type);
CREATE INDEX IF NOT EXISTS idx_indices_created_at ON indices(created_at DESC);

-- Create RLS policies for indices table
ALTER TABLE indices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all indices
CREATE POLICY "Allow authenticated users to read indices"
  ON indices FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert indices
CREATE POLICY "Allow authenticated users to insert indices"
  ON indices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own indices
CREATE POLICY "Allow users to update own indices"
  ON indices FOR UPDATE
  TO authenticated
  USING (created_by = current_user);

-- Allow authenticated users to delete their own indices
CREATE POLICY "Allow users to delete own indices"
  ON indices FOR DELETE
  TO authenticated
  USING (created_by = current_user);

-- Create storage bucket for indices files
INSERT INTO storage.buckets (id, name, public)
VALUES ('indices', 'indices', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated users to upload indices files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'indices');

CREATE POLICY "Allow public to read indices files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'indices');

CREATE POLICY "Allow authenticated users to delete own indices files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'indices' AND auth.uid()::text = owner);
