-- Crear tabla para estudios complementarios
CREATE TABLE IF NOT EXISTS medical_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  uploaded_by_name TEXT NOT NULL,
  observations TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_medical_studies_player_id ON medical_studies(player_id);
CREATE INDEX IF NOT EXISTS idx_medical_studies_uploaded_by ON medical_studies(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_medical_studies_created_at ON medical_studies(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_medical_studies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_medical_studies_updated_at
  BEFORE UPDATE ON medical_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_studies_updated_at();

COMMIT;
