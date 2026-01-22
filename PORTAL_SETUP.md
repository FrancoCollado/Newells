# Configuración del Portal de Jugadores

Se ha implementado el portal de jugadores bajo la ruta `/portal`.

## Requisitos Previos

Para que el sistema funcione correctamente, necesitas agregar las siguientes variables de entorno en tu archivo `.env.local`:

```env
# Clave de Rol de Servicio de Supabase (Service Role Key)
# Encuéntrala en Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# (Opcional) Secreto para firmar las cookies de sesión del portal
# Si no se define, se usa un valor por defecto (no seguro para producción)
PLAYER_PORTAL_SECRET=tu-secreto-super-seguro-random
```

## Rutas Implementadas

1.  **Login:** `/portal/login`
    - Ingreso solo con nombre completo (Soft Auth).
    - Valida existencia única en la DB.
2.  **Dashboard:** `/portal/dashboard`
    - Vista de tarjeta de jugador.
    - Edición de Peso y Altura.
    - Visualización de estadísticas básicas.

## Notas de Seguridad

- El sistema usa una cookie `player_session` independiente de la autenticación principal de Supabase.
- Las consultas se realizan con permisos de administrador (`service_role`) en el servidor para "saltar" las políticas RLS que requerirían un usuario autenticado de Supabase.
