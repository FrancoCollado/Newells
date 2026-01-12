# Newell's Old Boys - Sistema de Gestión Deportiva

Sistema integral para la gestión de jugadores, cuerpo técnico, entrenamientos y partidos del Club Atlético Newell's Old Boys.

![Estado](https://img.shields.io/badge/Estado-Producción%20Ready-success)
![Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20Supabase%20%7C%20Tailwind-blue)

## 🚀 Características Principales

*   **Gestión de Jugadores:** Base de datos centralizada de todas las divisiones (4ta a 13va). Soporta búsqueda y paginación eficiente.
*   **Historial Deportivo:** Registro de partidos, entrenamientos y estadísticas (goles, minutos, lesiones) con actualizaciones atómicas seguras.
*   **Gestor de Tácticas:** Herramienta visual para crear, guardar y cargar formaciones tácticas.
*   **Roles y Permisos (RBAC):** Sistema de permisos granulares para Dirigentes, Entrenadores y Cuerpo Médico.
*   **Áreas Profesionales:** Calendario de eventos y gestión de informes multidisciplinarios.
*   **Seguridad:** Protección de rutas mediante Middleware y datos mediante Row Level Security (RLS).

## 🛠️ Stack Tecnológico

*   **Frontend:** Next.js 16 (App Router), React 19.
*   **UI:** Tailwind CSS, Shadcn/UI, Lucide Icons.
*   **Backend:** Supabase (PostgreSQL, Auth).
*   **Lenguaje:** TypeScript.

## ⚙️ Configuración del Proyecto

### Prerrequisitos
*   Node.js 18+ (Recomendado v20+).
*   Gestor de paquetes `pnpm` (Recomendado) o `npm`.
*   Cuenta en Supabase.

### Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/newells-management.git
    cd newells-management
    ```

2.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

3.  **Configurar Variables de Entorno:**
    Crear un archivo `.env.local` en la raíz:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
    ```

4.  **Configurar Base de Datos (Supabase):**
    *   Ve al "SQL Editor" en tu dashboard de Supabase.
    *   Copia y ejecuta el contenido del archivo `supabase_schema.sql` incluido en este repositorio.
    *   **Importante:** Este script crea las tablas, configura RLS (seguridad) y las funciones RPC necesarias para la aplicación.

5.  **Crear Usuario Administrador:**
    *   En Supabase Auth, crea manualmente un usuario (ej: `admin@newells.com`).
    *   Por defecto, el sistema asigna roles en el código. Para producción, se recomienda crear una tabla `user_roles` o usar `user_metadata`. (En este MVP, el rol se puede simular o asignar mediante triggers si se extiende).

6.  **Iniciar Servidor de Desarrollo:**
    ```bash
    pnpm dev
    ```

## 🔐 Seguridad y Roles

El sistema implementa un modelo de seguridad en profundidad:

1.  **Middleware:** Intercepta peticiones y redirige a usuarios no autenticados antes de cargar la página.
2.  **RLS (Row Level Security):** Las políticas de PostgreSQL aseguran que solo usuarios autenticados puedan leer/escribir datos.
3.  **RBAC (Client-Side):**
    *   **Dirigente:** Acceso total.
    *   **Entrenador:** Gestión deportiva (Jugadores, Tácticas, Partidos).
    *   **Médico/Profesionales:** Acceso restringido a reportes de su área.

## 📂 Estructura del Proyecto

```
/app            # Rutas de Next.js (App Router)
  /dashboard    # Panel principal (Paginado)
  /manager      # Gestión de jugadores y tácticas
  /matches      # Carga de partidos
  /areas        # Gestión de áreas (Médica, Psicológica...)
/components     # Componentes React reutilizables (UI)
/lib            # Lógica de negocio y clientes API
  /auth.ts      # Autenticación
  /players.ts   # CRUD Jugadores (Server-side search)
  /formations.ts# CRUD Tácticas
  /rbac.ts      # Definición de Permisos
/types          # Definiciones TypeScript
```

## 📈 Escalabilidad

*   **Listas Infinitas:** Todas las listas principales (Partidos, Reportes, Jugadores) implementan paginación eficiente en servidor (`.range()`).
*   **Optimización:** Consultas optimizadas (ej: `HEAD` para conteos, filtros de fecha para calendarios).
*   **Concurrencia:** Uso de funciones RPC de Postgres para evitar condiciones de carrera en estadísticas.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un Issue para discutir cambios mayores antes de enviar un Pull Request.

---
© 2026 Club Atlético Newell's Old Boys - Sistema de Gestión