-- 044_create_nutrition_reports.sql
-- Tabla para almacenar los informes nutricionales y antropométricos

CREATE TABLE IF NOT EXISTS nutrition_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  report_date DATE DEFAULT CURRENT_DATE,
  
  -- Datos Antropométricos Básicos
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  
  -- Composición Corporal (%)
  fat_mass_percentage NUMERIC(4,2),
  muscle_mass_percentage NUMERIC(4,2),
  bone_mass_percentage NUMERIC(4,2),
  residual_mass_percentage NUMERIC(4,2),
  skin_mass_percentage NUMERIC(4,2),
  
  -- Somatotipo (Heath-Carter)
  endomorphy NUMERIC(4,2),
  mesomorphy NUMERIC(4,2),
  ectomorphy NUMERIC(4,2),
  
  -- Pliegues Cutáneos (mm)
  triceps_skinfold NUMERIC(4,1),
  subscapular_skinfold NUMERIC(4,1),
  supraspinal_skinfold NUMERIC(4,1),
  abdominal_skinfold NUMERIC(4,1),
  thigh_skinfold NUMERIC(4,1),
  calf_skinfold NUMERIC(4,1),
  
  -- Perímetros (cm)
  arm_relaxed_perimeter NUMERIC(4,1),
  arm_flexed_perimeter NUMERIC(4,1),
  waist_perimeter NUMERIC(4,1),
  hip_perimeter NUMERIC(4,1),
  thigh_perimeter NUMERIC(4,1),
  calf_perimeter NUMERIC(4,1),
  
  -- Observaciones
  observations TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE nutrition_reports ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Everyone with access can view nutrition reports"
  ON nutrition_reports FOR SELECT
  USING (true);

CREATE POLICY "Nutritionists and managers can manage reports"
  ON nutrition_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('dirigente', 'nutricionista')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_nutrition_reports_updated_at
  BEFORE UPDATE ON nutrition_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
