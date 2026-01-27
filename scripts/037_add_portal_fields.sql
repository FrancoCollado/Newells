-- Script para agregar campos solicitados para el portal de jugadores
-- 1. Representante: Teléfono (Nombre ya existe)
-- 2. Pasaporte: Número y detalle de origen
-- 3. Domicilio: Rosario (Personal/Origen ya existe como 'address' u 'origin_address')

ALTER TABLE players
ADD COLUMN IF NOT EXISTS representative_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS passport_origin VARCHAR(100),
ADD COLUMN IF NOT EXISTS rosario_address VARCHAR(255);

COMMENT ON COLUMN players.representative_phone IS 'Teléfono de contacto del representante';
COMMENT ON COLUMN players.passport_number IS 'Número de pasaporte';
COMMENT ON COLUMN players.passport_origin IS 'Datos de emisión/origen del pasaporte';
COMMENT ON COLUMN players.rosario_address IS 'Domicilio en Rosario (si difiere del personal)';
