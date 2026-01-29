-- Script para agregar campos de rehabilitación a las tablas players e injuries

-- 1. Agregar pierna dominante al jugador
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS dominant_foot TEXT;

-- 2. Agregar campos específicos de rehabilitación a la tabla de lesiones
ALTER TABLE injuries
ADD COLUMN IF NOT EXISTS surgery_date DATE,
ADD COLUMN IF NOT EXISTS rtr_notes TEXT, -- Return to Run
ADD COLUMN IF NOT EXISTS rtt_notes TEXT, -- Return to Training
ADD COLUMN IF NOT EXISTS rtp_notes TEXT; -- Return to Play

-- Comentarios para documentación
COMMENT ON COLUMN players.dominant_foot IS 'Pierna hábil del jugador (derecha, izquierda, ambidiestro)';
COMMENT ON COLUMN injuries.surgery_date IS 'Fecha de la cirugía si aplica';
COMMENT ON COLUMN injuries.rtr_notes IS 'Notas de kinesiología para Return to Run';
COMMENT ON COLUMN injuries.rtt_notes IS 'Notas de kinesiología para Return to Training';
COMMENT ON COLUMN injuries.rtp_notes IS 'Notas de kinesiología para Return to Play';
