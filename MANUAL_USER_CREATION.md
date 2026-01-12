# Creación Manual de Usuarios de Prueba

## PASO 1: Crear la Tabla de Perfiles (OBLIGATORIO)

Antes de crear usuarios, **DEBES** ejecutar el script de creación de la tabla profiles:

1. Ve al SQL Editor de Supabase: https://supabase.com/dashboard/project/jhhjkkgzoadtlfldlvsi/sql
2. Copia y ejecuta el contenido del archivo: `scripts/000_create_profiles_table.sql`
3. Verifica que se creó correctamente:
   ```sql
   SELECT * FROM public.profiles;
   ```

Este script crea:
- La tabla `profiles` con campos: id, email, name, role, created_at, updated_at
- Políticas RLS para seguridad
- **Trigger automático** que crea perfiles cuando se registran usuarios
- Índices para optimizar consultas

## PASO 2: Crear Usuarios desde Supabase Dashboard

1. Ve a tu proyecto: https://supabase.com/dashboard/project/jhhjkkgzoadtlfldlvsi
2. Ve a **Authentication** > **Users**
3. Haz clic en **Add user** > **Create new user**
4. Para cada usuario:

### Usuario 1: Administrador
- **Email**: `admin1@newells.com`
- **Password**: `newells123`
- **Auto Confirm User**: ✅ (activado)
- **User Metadata** (JSON):
```json
{
  "name": "Administrador 1",
  "role": "administrador"
}
```

### Usuario 2: Dirigente
- **Email**: `dirigente1@newells.com`
- **Password**: `newells123`
- **Auto Confirm User**: ✅ (activado)
- **User Metadata** (JSON):
```json
{
  "name": "Dirigente 1",
  "role": "dirigente"
}
```

### Usuario 3: Entrenador
- **Email**: `entrenador1@newells.com`
- **Password**: `newells123`
- **Auto Confirm User**: ✅ (activado)
- **User Metadata** (JSON):
```json
{
  "name": "Entrenador 1",
  "role": "entrenador"
}
```

### Usuario 4: Médico
- **Email**: `medico1@newells.com`
- **Password**: `newells123`
- **Auto Confirm User**: ✅ (activado)
- **User Metadata** (JSON):
```json
{
  "name": "Médico 1",
  "role": "medico"
}
```

### Usuario 5: Psicólogo
- **Email**: `psicologo1@newells.com`
- **Password**: `newells123`
- **Auto Confirm User**: ✅ (activado)
- **User Metadata** (JSON):
```json
{
  "name": "Psicólogo 1",
  "role": "psicologo"
}
```

## PASO 3: Verificar la Creación

Cuando crees cada usuario, el trigger automático creará su perfil en `public.profiles`. Verifica:

```sql
-- Ver todos los perfiles creados
SELECT id, email, name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Verificar que coincidan con auth.users
SELECT 
  au.email as auth_email,
  p.email as profile_email,
  p.name,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;
```

## ¿Por Qué Necesitamos la Tabla Profiles?

1. **Separación de Datos**: `auth.users` es para autenticación, `profiles` para datos de la aplicación
2. **Seguridad**: Podemos aplicar Row Level Security (RLS) en `profiles`
3. **Relaciones**: Otros registros (jugadores, divisiones) referencian `profiles`, no `auth.users`
4. **Consultas**: Es más eficiente consultar `profiles` que `user_metadata`
5. **Escalabilidad**: Podemos agregar más campos a `profiles` sin modificar auth

## Solución de Problemas

### Error: "Database error finding user"
- Causa: El esquema auth tiene problemas con triggers o constraints
- Solución: Crear usuarios manualmente desde el Dashboard (este método)

### No se crea el perfil automáticamente
- Verifica que el trigger `on_auth_user_created` existe:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Re-ejecuta el script `000_create_profiles_table.sql`

### El login falla después de crear el usuario
- Verifica que el perfil se haya creado:
  ```sql
  SELECT * FROM public.profiles WHERE email = 'admin1@newells.com';
  ```
- Si no existe, créalo manualmente:
  ```sql
  INSERT INTO public.profiles (id, email, name, role)
  SELECT id, email, 
         raw_user_meta_data->>'name' as name,
         raw_user_meta_data->>'role' as role
  FROM auth.users 
  WHERE email = 'admin1@newells.com';
  ```

## Permisos por Rol

- **administrador**: Acceso total, gestión de usuarios y sistema
- **dirigente**: Gestión de divisiones, jugadores, índices colectivos
- **entrenador**: Gestión de entrenamientos, índices individuales
- **medico**: Gestión de lesiones, informes médicos
- **psicologo**: Gestión de índices psicológicos
