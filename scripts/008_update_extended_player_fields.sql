-- Script para actualizar campos extendidos a la tabla players
-- Agrega nuevos campos y modifica la estructura de documentación legal

-- Agregando nuevos campos: ciudadania, tel_padres, representante
ALTER TABLE players
ADD COLUMN IF NOT EXISTS citizenship VARCHAR(100),
ADD COLUMN IF NOT EXISTS parents_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS representative VARCHAR(150);

-- Agregando campo de texto para detalles del convenio privado
ALTER TABLE players
ADD COLUMN IF NOT EXISTS private_agreement_details TEXT;

-- Agregando campos para la sección de Registro con años
ALTER TABLE players
ADD COLUMN IF NOT EXISTS signed_arf_year INTEGER,
ADD COLUMN IF NOT EXISTS signed_afa_year INTEGER,
ADD COLUMN IF NOT EXISTS free_player_year INTEGER;

-- Agregando campos para jugador a préstamo
ALTER TABLE players
ADD COLUMN IF NOT EXISTS is_on_loan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS loan_year INTEGER,
ADD COLUMN IF NOT EXISTS loan_club VARCHAR(150);

-- Comentarios para documentar cada nuevo campo
COMMENT ON COLUMN players.citizenship IS 'Ciudadanía del jugador';
COMMENT ON COLUMN players.parents_phone IS 'Teléfono de los padres';
COMMENT ON COLUMN players.representative IS 'Nombre del representante del jugador';
COMMENT ON COLUMN players.private_agreement_details IS 'Detalles del convenio privado';
COMMENT ON COLUMN players.signed_arf_year IS 'Año en que firmó A.R.F.';
COMMENT ON COLUMN players.signed_afa_year IS 'Año en que firmó A.F.A.';
COMMENT ON COLUMN players.free_player_year IS 'Año en que quedó como jugador libre';
COMMENT ON COLUMN players.is_on_loan IS 'Indica si el jugador está a préstamo';
COMMENT ON COLUMN players.loan_year IS 'Año en que se prestó al jugador';
COMMENT ON COLUMN players.loan_club IS 'Club al que se prestó el jugador';

-- Verificación de las columnas agregadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'players'
AND column_name IN (
  'citizenship', 'parents_phone', 'representative', 'private_agreement_details',
  'signed_arf_year', 'signed_afa_year', 'free_player_year',
  'is_on_loan', 'loan_year', 'loan_club'
)
ORDER BY column_name;
