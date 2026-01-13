-- Script para agregar campos extendidos a la tabla players
-- Estos campos NO son obligatorios y contienen información administrativa detallada

ALTER TABLE players
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS document VARCHAR(50),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS admission_date DATE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS address VARCHAR(255),
ADD COLUMN IF NOT EXISTS origin_locality VARCHAR(100),
ADD COLUMN IF NOT EXISTS origin_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS origin_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS father_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS tutor_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS health_insurance VARCHAR(150),
ADD COLUMN IF NOT EXISTS origin_league VARCHAR(150),
ADD COLUMN IF NOT EXISTS origin_club VARCHAR(150),
ADD COLUMN IF NOT EXISTS is_free_player BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_private_agreement BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS signed_arf BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS signed_afa BOOLEAN DEFAULT false;

-- Comentarios para documentar cada campo
COMMENT ON COLUMN players.birth_date IS 'Fecha de nacimiento del jugador';
COMMENT ON COLUMN players.document IS 'Número de documento de identidad';
COMMENT ON COLUMN players.province IS 'Provincia actual de residencia';
COMMENT ON COLUMN players.admission_date IS 'Fecha de ingreso al club';
COMMENT ON COLUMN players.phone IS 'Número de teléfono de contacto';
COMMENT ON COLUMN players.address IS 'Domicilio actual';
COMMENT ON COLUMN players.origin_locality IS 'Localidad de origen';
COMMENT ON COLUMN players.origin_address IS 'Domicilio de origen';
COMMENT ON COLUMN players.origin_province IS 'Provincia de origen';
COMMENT ON COLUMN players.father_name IS 'Nombre completo del padre';
COMMENT ON COLUMN players.mother_name IS 'Nombre completo de la madre';
COMMENT ON COLUMN players.tutor_name IS 'Nombre completo del tutor legal (si aplica)';
COMMENT ON COLUMN players.nationality IS 'Nacionalidad del jugador';
COMMENT ON COLUMN players.health_insurance IS 'Obra social o seguro médico';
COMMENT ON COLUMN players.origin_league IS 'Liga de procedencia';
COMMENT ON COLUMN players.origin_club IS 'Club de procedencia';
COMMENT ON COLUMN players.is_free_player IS 'Indica si el jugador es libre (sin contrato anterior)';
COMMENT ON COLUMN players.has_private_agreement IS 'Indica si tiene convenio privado con el club';
COMMENT ON COLUMN players.signed_arf IS 'Indica si firmó el documento A.R.F. (Asociación Rosarina de Fútbol)';
COMMENT ON COLUMN players.signed_afa IS 'Indica si firmó el documento A.F.A. (Asociación del Fútbol Argentino)';

-- Verificación de las columnas agregadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'players'
AND column_name IN (
  'birth_date', 'document', 'province', 'admission_date', 'phone', 'address',
  'origin_locality', 'origin_address', 'origin_province', 'father_name',
  'mother_name', 'tutor_name', 'nationality', 'health_insurance',
  'origin_league', 'origin_club', 'is_free_player', 'has_private_agreement',
  'signed_arf', 'signed_afa'
)
ORDER BY column_name;
