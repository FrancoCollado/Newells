-- Script para asignar automáticamente la división "arqueros" a todos los jugadores con posición "Arquero"

-- Actualizar la tabla players
-- Lógica:
-- 1. Buscar jugadores donde la posición sea 'Arquero'
-- 2. Asegurarse de que 'arqueros' NO esté ya en su lista de divisiones (para no duplicar)
-- 3. Agregar 'arqueros' al array de divisiones usando array_append

UPDATE public.players
SET division = array_append(division, 'arqueros')
WHERE position = 'Arquero' 
AND NOT ('arqueros' = ANY(division));

-- Confirmación
-- Deberías ver "UPDATE X" donde X es la cantidad de arqueros actualizados.
