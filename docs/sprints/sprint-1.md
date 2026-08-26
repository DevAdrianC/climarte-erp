# Sprint 1 — Fundación técnica

**Estado:** ✅ Completo
**Referencia:** `docs/04 - Plan de Desarrollo y MVP.md` §3

> Reconstruido a partir del código, las migraciones de Prisma y los tests existentes.

## Objetivos

Dejar la base del proyecto lista para que los sprints siguientes sean solo funcionalidad de negocio, sin decisiones técnicas pendientes.

## Alcance

### Infraestructura

- Monorepo con `npm workspaces`: `apps/api`, `apps/web`, `packages/shared` (esta última quedó vacía).
- Docker Compose de desarrollo: Postgres 16 con healthcheck, API (`:3000`) y web (`:5173`) — `docker-compose.yml`.
- Configuración por entorno vía `.env` / `.env.example` en la raíz y en `apps/web`.

### Backend (`apps/api`)

- NestJS 10 + Prisma 5 sobre PostgreSQL (`apps/api/prisma/schema.prisma`).
- `PrismaModule` / `PrismaService` como capa de acceso a datos (`src/prisma/`).
- Autenticación JWT con access + refresh token: `AuthModule`, `AuthService`, `JwtStrategy`, DTOs `login.dto.ts` y `refresh.dto.ts`.
- Infraestructura de autorización lista para roles futuros: `JwtAuthGuard`, `RolesGuard`, decoradores `@Roles()` y `@CurrentUser()` (`src/common/`).
- `UsuariosModule` para la resolución de usuarios.
- `SociosModule`: participación societaria versionada (`ConfiguracionParticipacion`), con la regla de que toda configuración nueva debe sumar exactamente 100% y cierra automáticamente la anterior dentro de una transacción.
- Cross-cutting: logging estructurado con Pino (redacta `authorization` y `password`), Swagger en `/api/docs`, Helmet, CORS y rate limiting global (`ThrottlerModule`, 100 req/min).

### Frontend (`apps/web`)

- React 18 + Vite 5 + Tailwind 3, con React Router, React Query, React Hook Form y Axios.
- `LoginPage`, `AuthContext` y cliente HTTP con manejo de token (`src/api/`).
- `Layout` con navegación lateral y `RutaProtegida` para las rutas autenticadas.
- `DashboardPage` consumiendo `/config-participacion`.
- `ProximamentePage` como placeholder de cada módulo futuro, etiquetado con el sprint que lo va a implementar.

## Entidades

`Rol` (enum `NombreRol`: ADMIN_SOCIO / TECNICO / ADMINISTRATIVO), `Usuario`, `ConfiguracionParticipacion`.

Creadas en la migración `20260816020631_agregar_clientes` — esa migración incluye tanto las tablas de fundación (`roles`, `usuarios`, `configuracion_participacion`) como `clientes`, porque el proyecto no llegó a generar una migración `init` separada.

## Endpoints

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/config-participacion` (vigente / historial)
- `POST /api/config-participacion`

## Tests

`apps/api/src/modules/socios/socios.service.spec.ts`:

- Rechaza una configuración cuya suma de porcentajes no sea 100.
- Acepta una configuración 50/50 y la crea dentro de una transacción.

## Regla no negociable introducida

`ConfiguracionParticipacion` es la única forma en que el sistema modifica la participación societaria. Ningún módulo operativo puede escribir en esa tabla. Ver [sprint-3.md](sprint-3.md), donde la regla se vuelve a testear desde Trabajos.

## Datos de prueba

`apps/api/prisma/seed.ts` crea los usuarios `nahuel@climarte.com.ar` y `adrian@climarte.com.ar` (password `climarte2026`) y la participación 50/50.
