-- Crear tabla para evoluciones psicosociales
CREATE TABLE IF NOT EXISTS psychosocial_evolutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('trayectoria_educativa', 'situacion_vincular', 'trayectoria_salud')),
  observations TEXT,
  file_url TEXT,
  file_name TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_psychosocial_evolutions_player_id ON psychosocial_evolutions(player_id);
CREATE INDEX IF NOT EXISTS idx_psychosocial_evolutions_category ON psychosocial_evolutions(category);
CREATE INDEX IF NOT EXISTS idx_psychosocial_evolutions_created_at ON psychosocial_evolutions(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE psychosocial_evolutions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios autenticados pueden ver evoluciones psicosociales"
  ON psychosocial_evolutions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo psicosocial y dirigentes pueden insertar evoluciones"
  ON psychosocial_evolutions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('psicosocial', 'dirigente')
    )
  );

CREATE POLICY "Solo psicosocial y dirigentes pueden eliminar evoluciones"
  ON psychosocial_evolutions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('psicosocial', 'dirigente')
    )
  );
