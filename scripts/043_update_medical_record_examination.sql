-- 043_update_medical_record_examination.sql
-- Actualización de la tabla medical_records para soportar el nuevo protocolo de Examen Médico

ALTER TABLE medical_records 
-- GENITALES
ADD COLUMN IF NOT EXISTS examination_genitals TEXT,

-- ABDOMINAL
ADD COLUMN IF NOT EXISTS abd_pared TEXT,
ADD COLUMN IF NOT EXISTS abd_sensibilidad TEXT,
ADD COLUMN IF NOT EXISTS abd_organomegalia TEXT,
ADD COLUMN IF NOT EXISTS abd_masas TEXT,

-- ALINEACION Y POSTURAS CORPORALES
ADD COLUMN IF NOT EXISTS postura_ideal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS postura_cifolordotica BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS postura_espalda_recta BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS postura_espalda_arqueada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS postura_escoleosis BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS postura_defectuosa_cabeza_hombros BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS postura_defectuosa_columna_pelvis BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS postura_defectuosa_pierna_rodilla_pie BOOLEAN DEFAULT false,

-- EVALUACION DE LOS MUSCULOS DEL TRONCO
ADD COLUMN IF NOT EXISTS tronco_extensores_espalda TEXT,
ADD COLUMN IF NOT EXISTS tronco_flexores_laterales TEXT,
ADD COLUMN IF NOT EXISTS tronco_flexores_oblicuos TEXT,
ADD COLUMN IF NOT EXISTS tronco_flexores_anteriores TEXT,

-- TEST DE FLEXIBILIDAD Y LONGITUD MUSCULAR
ADD COLUMN IF NOT EXISTS flex_longitud_flexores_cadera TEXT,
ADD COLUMN IF NOT EXISTS flex_longitud_isquiosurales TEXT,
ADD COLUMN IF NOT EXISTS flex_inclinacion_adelante TEXT,
ADD COLUMN IF NOT EXISTS flex_amplitud_movimiento_tronco TEXT,
ADD COLUMN IF NOT EXISTS flex_longitud_flexores_plantares TEXT,
ADD COLUMN IF NOT EXISTS flex_tensor_fascia_lata TEXT,
ADD COLUMN IF NOT EXISTS flex_longitud_glenohumerales TEXT,
ADD COLUMN IF NOT EXISTS flex_longitud_rotadores_hombro TEXT,
ADD COLUMN IF NOT EXISTS flex_extension_flexion_cervical TEXT,

-- EVALUACION DE MOVILIDAD
ADD COLUMN IF NOT EXISTS mov_rotacion_caderas TEXT,
ADD COLUMN IF NOT EXISTS mov_cuclillas TEXT,
ADD COLUMN IF NOT EXISTS mov_bisagra_cadera TEXT,
ADD COLUMN IF NOT EXISTS mov_cuadripedia_flexo_extension TEXT,
ADD COLUMN IF NOT EXISTS mov_cuadripedia_torsion TEXT,

-- OBSERVACIONES/COMENTARIOS
ADD COLUMN IF NOT EXISTS examination_observations TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN medical_records.postura_ideal IS 'Si es SI, el resto de posturas deben ser NO';
COMMENT ON COLUMN medical_records.tronco_extensores_espalda IS 'Opciones: Déficit/sin déficit';
COMMENT ON COLUMN medical_records.flex_longitud_flexores_cadera IS 'Opciones: Déficit/sin déficit';
COMMENT ON COLUMN medical_records.mov_rotacion_caderas IS 'Opciones: Déficit/sin déficit';
