-- Script para agregar campos de pensión y datos escolares
-- Ejecutar este script para añadir las nuevas columnas a la tabla players

-- Agregar campo pensión (si/no)
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_pensioned BOOLEAN DEFAULT FALSE;

-- Agregar campos de datos escolares
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_regular_student BOOLEAN DEFAULT FALSE;

ALTER TABLE players
ADD COLUMN IF NOT EXISTS school_situation TEXT;

ALTER TABLE players
ADD COLUMN IF NOT EXISTS school_year TEXT;

-- Índice para optimizar búsquedas de jugadores pensionados
CREATE INDEX IF NOT EXISTS idx_players_pensioned ON players(is_pensioned) WHERE is_pensioned = TRUE;
