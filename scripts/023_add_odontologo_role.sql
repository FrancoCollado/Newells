-- Agregar rol "odontologo" al sistema
-- Este script actualiza la constraint de la tabla profiles para incluir el nuevo rol

-- 1. Primero eliminamos la constraint existente
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Agregamos la nueva constraint con el rol "odontologo" incluido
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'medico', 
  'psicologo', 
  'entrenador', 
  'nutricionista', 
  'fisioterapeuta', 
  'dirigente', 
  'administrador',
  'entrenador_arqueros',
  'kinesiologo',
  'psicosocial',
  'odontologo'
));

-- 3. Actualizar el comentario de la columna role
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario: medico, psicologo, entrenador, entrenador_arqueros, nutricionista, fisioterapeuta, kinesiologo, dirigente, administrador, psicosocial, odontologo';

-- Nota: Las áreas se manejan dinámicamente en area_reports y area_events
-- El área "odontologia" ya está soportada sin necesidad de cambios en la base de datos
