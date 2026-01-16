-- Reemplazar índices individuales (dolor muscular, estrés, sueño) por wellness
-- Primero eliminamos los tipos antiguos de ambas tablas

-- Para la tabla indices (colectivos)
DELETE FROM indices WHERE type IN ('DOLOR_MUSCULAR', 'ESTRES', 'SUENO');

-- Para la tabla player_indices (individuales)
DELETE FROM player_indices WHERE type IN ('DOLOR_MUSCULAR', 'ESTRES', 'SUENO');

-- Los tipos ahora serán: GPS, RPE, PAUTAS_FUERZA, WELLNESS, UNIDAD_ARBITRARIA, ONDULACIONES
-- No es necesario modificar la estructura de las tablas ya que el campo 'type' es VARCHAR
-- y puede contener cualquier valor. El nuevo tipo 'WELLNESS' se agregará cuando se use.

-- Confirmación
SELECT 'Índices antiguos eliminados. Ahora puede usar el tipo WELLNESS' AS status;
