-- Agregar área de arqueros
-- El área ya se maneja dinámicamente en el código, no requiere tabla específica

-- Agregar rol de entrenador_arqueros a la tabla profiles
-- (Si necesitas agregar usuarios con este rol, hazlo manualmente o mediante un script adicional)

-- Agregar campos para entrenamientos (hipervínculo y archivos)
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Agregar campo de goles en contra para match_players
ALTER TABLE match_players ADD COLUMN IF NOT EXISTS goals_against INTEGER DEFAULT 0;

-- Comentarios
COMMENT ON COLUMN trainings.link IS 'Hipervínculo opcional relacionado con el entrenamiento';
COMMENT ON COLUMN trainings.attachments IS 'Archivos adjuntos del entrenamiento en formato JSON';
COMMENT ON COLUMN match_players.goals_against IS 'Goles en contra (solo para arqueros)';
