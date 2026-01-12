-- Script para crear usuarios de prueba con diferentes roles
-- Cada usuario tiene:
-- - Email: [rol]1@newells.com
-- - Password: newells123 (para todos)
-- - Metadata con nombre y rol correspondiente

-- IMPORTANTE: Este script debe ejecutarse desde el Dashboard de Supabase
-- en la sección de SQL Editor, ya que necesita permisos para crear usuarios
-- en auth.users

-- 1. Usuario ADMINISTRADOR
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin1@newells.com',
  crypt('newells123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Administrador 1","role":"administrador"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- 2. Usuario DIRIGENTE
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dirigente1@newells.com',
  crypt('newells123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Dirigente 1","role":"dirigente"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- 3. Usuario ENTRENADOR
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'entrenador1@newells.com',
  crypt('newells123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Entrenador 1","role":"entrenador"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- 4. Usuario MEDICO
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'medico1@newells.com',
  crypt('newells123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Médico 1","role":"medico"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- 5. Usuario PSICOLOGO
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'psicologo1@newells.com',
  crypt('newells123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Psicólogo 1","role":"psicologo"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- Verificar que los usuarios fueron creados correctamente
SELECT 
  email,
  raw_user_meta_data->>'name' as nombre,
  raw_user_meta_data->>'role' as rol,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN (
  'admin1@newells.com',
  'dirigente1@newells.com',
  'entrenador1@newells.com',
  'medico1@newells.com',
  'psicologo1@newells.com'
)
ORDER BY email;

-- CREDENCIALES DE ACCESO:
-- ======================
-- admin1@newells.com       / newells123  (ADMINISTRADOR - acceso total)
-- dirigente1@newells.com   / newells123  (DIRIGENTE - gestión completa)
-- entrenador1@newells.com  / newells123  (ENTRENADOR - gestión de entrenamientos)
-- medico1@newells.com      / newells123  (MEDICO - reportes médicos)
-- psicologo1@newells.com   / newells123  (PSICOLOGO - reportes psicológicos)
