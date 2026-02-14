-- 044_updated_nutrition_reports_v2.sql
-- Nueva versión de la tabla de nutrición basada exactamente en el informe oficial de Newell's

DROP TABLE IF EXISTS nutrition_reports;

CREATE TABLE nutrition_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  report_date DATE DEFAULT CURRENT_DATE,
  
  -- Datos Antropométricos (Según Imagen)
  weight NUMERIC(5,2), -- Peso Actual
  height NUMERIC(5,2), -- Talla
  muscle_kg NUMERIC(5,2), -- KG de Músculo
  fat_kg NUMERIC(5,2), -- KG de Tej. Adiposo
  muscle_percentage NUMERIC(5,2), -- % de Músculo
  fat_percentage NUMERIC(5,2), -- % de Tej. Adiposo
  im_o NUMERIC(5,2), -- IM/O
  sum_6_pliegues NUMERIC(5,2), -- Sumatoria 6 Pliegues
  
  -- Información adicional
  observations TEXT,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE nutrition_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Enable read access for all authorized users"
  ON nutrition_reports FOR SELECT
  USING (true);

CREATE POLICY "Enable manage access for nutritionists and directors"
  ON nutrition_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('dirigente', 'nutricionista')
    )
  );

-- Trigger para mantener actualizado updated_at
CREATE TRIGGER set_nutrition_reports_updated_at
  BEFORE UPDATE ON nutrition_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación técnica
COMMENT ON TABLE nutrition_reports IS 'Informes de composición corporal y antropometría';
COMMENT ON COLUMN nutrition_reports.im_o IS 'Índice Músculo/Óseo';
COMMENT ON COLUMN nutrition_reports.sum_6_pliegues IS 'Suma de pliegues cutáneos (Tríceps, Subescapular, Supraespinal, Abdominal, Muslo medial, Pantorrilla)';
