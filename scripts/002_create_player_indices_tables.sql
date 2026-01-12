-- Create player_indices table for storing individual player indices
CREATE TABLE IF NOT EXISTS player_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'GPS', 'RPE', 'PAUTAS_FUERZA', 'DOLOR_MUSCULAR', 'ESTRES', 'SUENO', 'UNIDAD_ARBITRARIA', 'ONDULACIONES'
  subtype VARCHAR(50), -- For GPS: 'CRONICO' or 'AGUDO', For RPE: 'PRE_SESION' or 'POST_SESION'
  observations TEXT,
  file_url TEXT, -- URL to the uploaded file in Supabase Storage
  file_name TEXT, -- Original filename
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by player_id and type
CREATE INDEX IF NOT EXISTS idx_player_indices_player_id ON player_indices(player_id);
CREATE INDEX IF NOT EXISTS idx_player_indices_type ON player_indices(type);
CREATE INDEX IF NOT EXISTS idx_player_indices_created_at ON player_indices(created_at DESC);

-- Create RLS policies for player_indices table
ALTER TABLE player_indices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all player indices
CREATE POLICY "Allow authenticated users to read player indices"
  ON player_indices FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert player indices
CREATE POLICY "Allow authenticated users to insert player indices"
  ON player_indices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own player indices
CREATE POLICY "Allow users to update own player indices"
  ON player_indices FOR UPDATE
  TO authenticated
  USING (created_by = current_user);

-- Allow authenticated users to delete their own player indices
CREATE POLICY "Allow users to delete own player indices"
  ON player_indices FOR DELETE
  TO authenticated
  USING (created_by = current_user);

-- Storage bucket 'indices' is already created and will be reused for player indices files
