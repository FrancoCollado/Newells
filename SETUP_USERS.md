# Configuración de Usuarios de Prueba

## IMPORTANTE: Primero Ejecutar el Script de Profiles

Antes de crear usuarios, debes ejecutar el script SQL que crea la tabla de perfiles:

1. Ve al SQL Editor de Supabase: https://supabase.com/dashboard/project/jhhjkkgzoadtlfldlvsi/sql
2. Ejecuta el script: `scripts/000_create_profiles_table.sql`
3. Este script creará:
   - La tabla `profiles` para almacenar información de usuarios
   - Políticas RLS (Row Level Security) para seguridad
   - Trigger automático que crea un perfil cuando se registra un usuario
   - Índices para mejorar el rendimiento

## Método 1: Crear desde la Página de Setup (Más Fácil)

1. Asegúrate de haber ejecutado el script `000_create_profiles_table.sql`

2. Visita la página: `/setup`

3. Haz clic en "Crear Usuarios Automáticamente"

4. Los usuarios se crearán con el trigger automático que insertará sus perfiles

## Método 2: Crear Manualmente desde Supabase Dashboard

Si prefieres crear los usuarios manualmente (método más confiable si hay problemas):

1. **Primero**: Ejecuta `scripts/000_create_profiles_table.sql` en el SQL Editor

2. Ve a Authentication > Users en tu Dashboard de Supabase

3. Haz clic en "Add user" > "Create new user"

4. Para cada usuario, el trigger creará automáticamente el perfil usando los datos de `user_metadata`

Ver detalles completos en: `MANUAL_USER_CREATION.md`

## Usuarios que se Crearán

| Email | Contraseña | Nombre | Rol |
|-------|-----------|--------|-----|
| admin1@newells.com | newells123 | Administrador 1 | administrador |
| dirigente1@newells.com | newells123 | Dirigente 1 | dirigente |
| entrenador1@newells.com | newells123 | Entrenador 1 | entrenador |
| medico1@newells.com | newells123 | Médico 1 | medico |
| psicologo1@newells.com | newells123 | Psicólogo 1 | psicologo |

## Cómo Funciona la Integración Profiles + Auth

1. Cuando creas un usuario en `auth.users` (ya sea por signup o manualmente)
2. El trigger `on_auth_user_created` se ejecuta automáticamente
3. Crea un registro en `public.profiles` con los datos de `user_metadata`
4. La aplicación consulta `profiles` para obtener el rol y nombre del usuario
5. Si falla la consulta a `profiles`, hace fallback a `user_metadata`

## Verificación

Después de crear los usuarios, verifica:

1. Ve a `/login` y prueba cada usuario
2. Verifica que se haya creado el perfil en la tabla `profiles` (SQL Editor):
   ```sql
   SELECT * FROM public.profiles;
   ```

## Permisos por Rol

- **administrador**: Acceso completo al sistema, gestión de usuarios
- **dirigente**: Gestión de divisiones, jugadores, índices colectivos
- **entrenador**: Gestión de entrenamientos, índices individuales de jugadores
- **medico**: Gestión de lesiones, informes médicos
- **psicologo**: Gestión de índices psicológicos de jugadores
