-- Script para crear la tabla de lesiones varias
CREATE TABLE IF NOT EXISTS injuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Datos generales (algunos vienen del jugador)
  injury_date DATE NOT NULL,
  injury_time TIME,
  context TEXT CHECK (context IN ('entrenamiento', 'partido_oficial', 'partido_amistoso')),
  game_minute TEXT,
  surface TEXT CHECK (surface IN ('cesped_natural', 'cesped_sintetico', 'otra')),
  
  -- Mecanismo de la lesión
  mechanism_type TEXT CHECK (mechanism_type IN ('contacto', 'no_contacto', 'sobrecarga', 'trauma_indirecto')),
  specific_situation TEXT CHECK (specific_situation IN ('sprint', 'cambio_direccion', 'salto_caida', 'golpe_choque', 'disparo', 'aceleracion_desaceleracion')),
  
  -- Localización anatómica
  anatomical_location TEXT,
  affected_side TEXT CHECK (affected_side IN ('derecho', 'izquierdo', 'bilateral')),
  
  -- Tipo de lesión
  injury_type TEXT CHECK (injury_type IN ('muscular', 'tendinosa', 'ligamentosa', 'meniscal_cartilago', 'contusion_hematoma', 'fractura_osea', 'conmocion_cerebral', 'otra')),
  injury_type_other TEXT,
  clinical_diagnosis TEXT,
  
  -- Grado de severidad
  severity TEXT CHECK (severity IN ('leve', 'moderada', 'severa')),
  days_absent INTEGER,
  
  -- Evolución
  evolution_type TEXT CHECK (evolution_type IN ('nueva', 'recaida', 'recidiva')),
  treatment TEXT CHECK (treatment IN ('conservador', 'quirurgico', 'infiltracion_prp')),
  
  -- Imágenes complementarias
  has_ultrasound BOOLEAN DEFAULT false,
  has_mri BOOLEAN DEFAULT false,
  has_xray BOOLEAN DEFAULT false,
  has_ct BOOLEAN DEFAULT false,
  imaging_findings TEXT,
  
  -- Alta y Return to Play
  medical_discharge_date DATE,
  progressive_return_date DATE,
  competitive_rtp_date DATE,
  rtp_criteria_clinical BOOLEAN DEFAULT false,
  rtp_criteria_functional BOOLEAN DEFAULT false,
  rtp_criteria_strength BOOLEAN DEFAULT false,
  rtp_criteria_gps BOOLEAN DEFAULT false,
  
  -- Observaciones
  medical_observations TEXT,
  responsible_doctor TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar lesiones por jugador
CREATE INDEX IF NOT EXISTS idx_injuries_player ON injuries(player_id);

-- Índice para buscar lesiones por fecha
CREATE INDEX IF NOT EXISTS idx_injuries_date ON injuries(injury_date DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_injuries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_injuries_updated_at
  BEFORE UPDATE ON injuries
  FOR EACH ROW
  EXECUTE FUNCTION update_injuries_updated_at();
