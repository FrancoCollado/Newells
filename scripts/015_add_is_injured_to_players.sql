-- Agregar campo is_injured a la tabla players
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_injured BOOLEAN DEFAULT FALSE;

-- Índice para consultas rápidas de jugadores lesionados
CREATE INDEX IF NOT EXISTS idx_players_is_injured ON players(is_injured) WHERE is_injured = TRUE;
