-- Script para diagnosticar y reparar problemas de autenticación en Supabase
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- ========================================
-- PARTE 1: DIAGNÓSTICO
-- ========================================

-- 1. Verificar triggers en auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- 2. Verificar ownership de objetos en auth schema
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'auth';

-- 3. Verificar funciones relacionadas con triggers
SELECT 
    routine_schema,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%user%' 
  OR routine_name LIKE '%profile%';

-- 4. Verificar constraints en auth.users
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'auth' 
  AND tc.table_name = 'users'
  AND tc.constraint_type = 'FOREIGN KEY';

-- ========================================
-- PARTE 2: REPARACIÓN COMÚN
-- ========================================

-- Si tienes una función handle_new_user con problemas, recrémosla con security definer
-- SOLO ejecuta esto si la función existe y causa problemas

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recrear la función con security definer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar perfil básico para el nuevo usuario
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Si falla, no bloquear la creación del usuario
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- PARTE 3: VERIFICAR PERMISOS
-- ========================================

-- Verificar que supabase_auth_admin tenga los permisos correctos
DO $$
BEGIN
  -- Asegurar ownership de auth.users
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'auth' 
    AND tablename = 'users'
    AND tableowner != 'supabase_auth_admin'
  ) THEN
    RAISE NOTICE 'ADVERTENCIA: auth.users no es propiedad de supabase_auth_admin';
    -- NO ejecutar ALTER TABLE en producción sin backup
    -- ALTER TABLE auth.users OWNER TO supabase_auth_admin;
  END IF;
END $$;

-- ========================================
-- CONSULTA FINAL: Ver errores recientes
-- ========================================
SELECT 
  'Ejecuta esta consulta en el Log Explorer de Supabase Dashboard' as instruccion,
  'para ver errores de auth recientes' as descripcion;

/*
-- Ejecuta en Log Explorer:
select
  cast(postgres_logs.timestamp as datetime) as timestamp,
  event_message,
  parsed.error_severity,
  parsed.user_name,
  parsed.query,
  parsed.detail
from postgres_logs
cross join unnest(metadata) as metadata
cross join unnest(metadata.parsed) as parsed
where
  regexp_contains(parsed.error_severity, 'ERROR|FATAL|PANIC')
  and regexp_contains(parsed.user_name, 'supabase_auth_admin')
order by timestamp desc
limit 20;
*/
