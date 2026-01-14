-- Crear tabla para evoluciones de lesiones
CREATE TABLE IF NOT EXISTS injury_evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  injury_id UUID NOT NULL REFERENCES injuries(id) ON DELETE CASCADE,
  evolution_text TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_injury_evolutions_injury_id ON injury_evolutions(injury_id);
CREATE INDEX IF NOT EXISTS idx_injury_evolutions_created_at ON injury_evolutions(created_at DESC);

-- RLS policies
ALTER TABLE injury_evolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver evoluciones"
  ON injury_evolutions FOR SELECT
  USING (true);

CREATE POLICY "Médicos y dirigentes pueden crear evoluciones"
  ON injury_evolutions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('medico', 'dirigente')
    )
  );
