-- Script para crear la tabla de enfermedades
CREATE TABLE IF NOT EXISTS illnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Tipo de enfermedad
  infeccion_respiratoria BOOLEAN DEFAULT false,
  infeccion_otros_organos BOOLEAN DEFAULT false,
  fatiga_malestar BOOLEAN DEFAULT false,
  asma_alergias BOOLEAN DEFAULT false,
  dolor_estomago BOOLEAN DEFAULT false,
  dolor_cabeza BOOLEAN DEFAULT false,
  otro_tipo BOOLEAN DEFAULT false,
  
  -- Sistema orgánico afectado
  respiratorio BOOLEAN DEFAULT false,
  dermatologico BOOLEAN DEFAULT false,
  neurologico BOOLEAN DEFAULT false,
  inmunologico BOOLEAN DEFAULT false,
  metabolico BOOLEAN DEFAULT false,
  trastorno_reumatologico BOOLEAN DEFAULT false,
  renal_urogenital BOOLEAN DEFAULT false,
  hematologico BOOLEAN DEFAULT false,
  cardiovascular BOOLEAN DEFAULT false,
  psiquiatrica BOOLEAN DEFAULT false,
  dental BOOLEAN DEFAULT false,
  oftalmologico BOOLEAN DEFAULT false,
  ambiental BOOLEAN DEFAULT false,
  otro_sistema BOOLEAN DEFAULT false,
  otro_sistema_descripcion TEXT,
  
  -- Recurrencia
  nueva_lesion TEXT,
  diagnostico TEXT,
  otros_comentarios TEXT,
  fecha_regreso_juego DATE,
  
  -- Archivos adjuntos
  attachments JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar enfermedades por jugador
CREATE INDEX IF NOT EXISTS idx_illnesses_player ON illnesses(player_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_illnesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_illnesses_updated_at
  BEFORE UPDATE ON illnesses
  FOR EACH ROW
  EXECUTE FUNCTION update_illnesses_updated_at();
