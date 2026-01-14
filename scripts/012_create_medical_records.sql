-- Create medical_records table for storing comprehensive medical information
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Personal Information
  birth_date DATE,
  birth_place_city TEXT,
  birth_place_province TEXT,
  birth_place_country TEXT,
  current_address_city TEXT,
  current_address_province TEXT,
  current_address_country TEXT,
  dni TEXT,
  passport TEXT,
  phone_landline TEXT,
  phone_mobile TEXT,
  social_security_type TEXT,
  social_security_number TEXT,
  primary_doctor_name TEXT,
  primary_doctor_phone TEXT,
  
  -- Allergies and Medication
  allergies TEXT,
  current_medication TEXT,
  
  -- Family Context
  living_with_father BOOLEAN DEFAULT false,
  living_with_mother BOOLEAN DEFAULT false,
  living_with_siblings BOOLEAN DEFAULT false,
  living_with_partner BOOLEAN DEFAULT false,
  living_with_others TEXT,
  relationship_status TEXT, -- 'estable', 'ocasional', 'ninguna'
  economic_support TEXT, -- 'personal', 'padres', 'otros'
  religion TEXT,
  
  -- Family History (all boolean fields for YES/NO questions)
  family_history_cardiac BOOLEAN DEFAULT false,
  family_history_cancer BOOLEAN DEFAULT false,
  family_history_emotional BOOLEAN DEFAULT false,
  family_history_headaches BOOLEAN DEFAULT false,
  family_history_anemia BOOLEAN DEFAULT false,
  family_history_allergies_asthma BOOLEAN DEFAULT false,
  family_history_epilepsy BOOLEAN DEFAULT false,
  family_history_diabetes BOOLEAN DEFAULT false,
  family_history_stomach BOOLEAN DEFAULT false,
  family_history_renal BOOLEAN DEFAULT false,
  family_history_sudden_death BOOLEAN DEFAULT false,
  family_history_genetic BOOLEAN DEFAULT false,
  family_history_hypertension BOOLEAN DEFAULT false,
  
  -- Personal History (arrays for multiple entries)
  personal_pathological JSONB DEFAULT '[]'::jsonb, -- [{condition: string, details: string}]
  personal_surgical JSONB DEFAULT '[]'::jsonb, -- [{procedure: string, details: string}]
  personal_injuries JSONB DEFAULT '[]'::jsonb, -- [{injury: string, details: string}]
  personal_comments TEXT,
  
  -- Sports History
  sports_history JSONB DEFAULT '[]'::jsonb, -- [{sport: string, age_started: number, duration: string, competitive: boolean, observations: string}]
  
  -- Medical Examination
  examining_doctor TEXT,
  exam_date DATE,
  blood_pressure TEXT,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  
  -- Central Nervous System
  cns_anomalies TEXT,
  
  -- Eyes, Ears, Nose, Throat
  visual_acuity_left TEXT,
  visual_acuity_right TEXT,
  color_vision TEXT,
  ocular_movements TEXT,
  visual_field TEXT,
  dominant_eye TEXT, -- 'derecho', 'izquierdo'
  ear_condition TEXT,
  nose_condition TEXT,
  neck_thyroid TEXT,
  dental_pieces TEXT,
  ear_canal TEXT,
  laterality TEXT,
  pupils TEXT,
  tympanic_membranes TEXT,
  neck_lymph_nodes TEXT,
  isocoric_reactive TEXT,
  tonsils TEXT,
  dental_pieces_condition TEXT,
  dentures TEXT,
  gums TEXT,
  ent_anomalies TEXT,
  
  -- Respiratory
  lungs_condition TEXT,
  chest_symmetry TEXT,
  chest_auscultation TEXT,
  upper_airway_permeability TEXT,
  peak_flow TEXT,
  chest_expansion TEXT,
  respiratory_anomalies TEXT,
  
  -- Cardiovascular
  peripheral_pulse_rhythm TEXT,
  carotid_pulse TEXT,
  radial_pulse TEXT,
  pedal_pulse TEXT,
  tibial_pulse TEXT,
  precordial_sounds TEXT,
  abnormal_sounds TEXT,
  apical_rhythm TEXT,
  fremitus TEXT,
  cardiovascular_anomalies TEXT,
  cardiovascular_pathologies TEXT,
  
  -- Skin
  skin_lesions TEXT,
  skin_trophism TEXT,
  varicose_veins BOOLEAN DEFAULT false,
  hernias BOOLEAN DEFAULT false,
  skin_anomalies TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  
  UNIQUE(player_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_medical_records_player_id ON medical_records(player_id);

-- Enable RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Policy: Medical staff and dirigentes can view all medical records
CREATE POLICY "Medical staff can view medical records"
  ON medical_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('dirigente', 'medico')
    )
  );

-- Policy: Only doctors can insert/update medical records
CREATE POLICY "Doctors can manage medical records"
  ON medical_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('dirigente', 'medico')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
