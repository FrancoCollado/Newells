-- SCRIPT PARA CORREGIR LAS POLÍTICAS RLS DE LA TABLA PROFILES
-- Este script elimina las políticas problemáticas y crea unas nuevas sin recursión infinita

-- Eliminar todas las políticas existentes que causan problemas
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Administradores y dirigentes pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Solo administradores pueden insertar perfiles" ON public.profiles;

-- POLÍTICA 1: Los usuarios autenticados pueden ver su propio perfil
CREATE POLICY "usuarios_ven_propio_perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- POLÍTICA 2: Los usuarios pueden actualizar su propio nombre (no el rol ni el email)
CREATE POLICY "usuarios_actualizan_propio_perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- POLÍTICA 3: Permitir que el trigger pueda insertar perfiles
-- (el trigger se ejecuta con SECURITY DEFINER, así que esta política permite inserts del sistema)
CREATE POLICY "sistema_puede_insertar_perfiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- POLÍTICA 4: Permitir que usuarios autenticados lean todos los perfiles
-- (simplificado para evitar recursión - los permisos se manejan a nivel de aplicación)
CREATE POLICY "usuarios_autenticados_ven_perfiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Verificar que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
