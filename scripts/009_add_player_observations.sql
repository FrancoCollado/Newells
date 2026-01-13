-- Agregar columna de observaciones/detalles para los jugadores
-- Permite a dirigentes y entrenadores agregar notas generales sobre cada jugador

ALTER TABLE players
ADD COLUMN IF NOT EXISTS observations TEXT;

COMMENT ON COLUMN players.observations IS 'Observaciones generales y notas varias sobre el jugador';
