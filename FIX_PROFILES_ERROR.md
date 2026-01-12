# Solución al Error de Recursión Infinita en Profiles

## Problema
El error `infinite recursion detected in policy for relation "profiles"` ocurre porque las políticas RLS originales causan un bucle infinito al intentar verificar permisos.

## Solución

### Paso 1: Ejecutar el script de corrección
1. Ve al Dashboard de Supabase: https://jhhjkkgzoadtlfldlvsi.supabase.co
2. Menú lateral → **SQL Editor**
3. Click en **New Query**
4. Copia y pega el contenido de `scripts/005_fix_profiles_rls_policies.sql`
5. Click en **Run**

Este script:
- Elimina las políticas problemáticas
- Crea nuevas políticas simplificadas sin recursión
- Permite que todos los usuarios autenticados vean perfiles (los permisos específicos se manejan en la aplicación)

### Paso 2: Verificar los datos en la tabla profiles
1. Menú lateral → **Table Editor** → Selecciona **profiles**
2. Busca el registro con email `admin@gmail.com`
3. Edita los campos:
   - `name`: El nombre que quieras (ej: "Administrador")
   - `role`: `administrador`
4. Guarda los cambios

### Paso 3: Probar el login
1. Cierra sesión si estás logueado
2. Ve a `/login`
3. Ingresa:
   - Email: `admin@gmail.com`
   - Password: `newells123`
4. Deberías ver tu nombre correcto y el rol de administrador

## Usuarios de Prueba Recomendados

Después de solucionar el problema, crea estos usuarios en Authentication → Users:

| Email | Password | Role |
|-------|----------|------|
| admin@gmail.com | newells123 | administrador |
| dirigente1@newells.com | newells123 | dirigente |
| entrenador1@newells.com | newells123 | entrenador |
| medico1@newells.com | newells123 | medico |
| psicologo1@newells.com | newells123 | psicologo |

**Recuerda:** Después de crear cada usuario en Authentication, edita su perfil en la tabla `profiles` para asignarle el rol correcto.
