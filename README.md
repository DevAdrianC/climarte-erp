# CLIMARTE ERP

ERP interno de CLIMARTE (instalación, reparación y mantenimiento de climatización y refrigeración). Este repositorio implementa el sistema descripto en `docs/01` a `docs/04`.

## Documentación del proyecto

- `docs/01 - Análisis y Arquitectura.md`
- `docs/02 - Especificación Funcional.md`
- `docs/03 - Arquitectura Técnica.md`
- `docs/04 - Plan de Desarrollo y MVP.md`

Cualquier decisión de negocio o técnica debe rastrearse a estos documentos. Si el código y la documentación entran en conflicto, se corrige el código (o se actualiza la documentación explícitamente, nunca en silencio).

## Estado del proyecto

El detalle por sprint vive en `docs/sprints/` — **esa carpeta es la fuente de verdad del progreso**.

| Sprint | Alcance | Estado |
|---|---|---|
| Sprint 1 | Fundación técnica (monorepo, Prisma, JWT, roles/guards, layout web) | ✅ Completo |
| Sprint 2 | Clientes (alta, edición, búsqueda, ficha) | ✅ Completo (con 1 pendiente, ver abajo) |
| Sprint 3 | Trabajos (3 estados, participantes, costos, garantía, catálogos) | ✅ Completo |
| Sprint 4 | Gastos, Vehículo y Herramientas | 🔜 Por arrancar (sprint actual) |
| Sprint 5–8 | Liquidación, Dashboard, Reportes/Auditoría, Producción | ⬜ Pendiente |

### Implementado a hoy

- Monorepo (`npm workspaces`): `apps/api` (NestJS + Prisma), `apps/web` (React + Vite + Tailwind).
- Autenticación JWT (access + refresh token), con guards de rol ya preparados para Técnico/Administrativo aunque hoy solo exista Admin/Socio.
- Módulo de Socios: configuración de participación societaria versionada, con la regla de que siempre debe sumar 100%.
- Módulo de Clientes: alta, edición, búsqueda por nombre/teléfono/localidad, ficha de detalle.
- Módulo de Trabajos: alta, los tres estados independientes (comercial/operativo/pago), participantes (socios y colaboradores externos), costos con `pagado_por`, garantía de 90 días por defecto y validación de que no se puede finalizar sin `precio_final`.
- Módulo de Catálogos: tipos de servicio, tipos de equipo, colaboradores externos, usuarios activos.
- Logging estructurado (Pino), Swagger (`/api/docs`), Helmet, CORS, rate limiting.
- Frontend: login, layout con navegación, dashboard, ABM de clientes y de trabajos contra la API real.
- Tests unitarios de las reglas no negociables (`socios.service.spec.ts`, `trabajos.service.spec.ts`).

### Deuda técnica conocida

- `GET /api/clientes/:id/trabajos` devuelve siempre `[]`: es un stub del Sprint 2 que el Sprint 3 debía completar y quedó sin conectar al modelo `Trabajo`.
- `packages/shared/` está declarada como workspace en `package.json` pero está vacía (sin `package.json` propio). Hoy no la importa nadie, así que no rompe el build.
- No existe `.github/workflows/`: el CI de GitHub Actions mencionado en el plan todavía no está creado.
- No existe `.gitignore` en la raíz.

### Setup inicial de la base (primera vez)

```bash
cd apps/api
npx prisma generate
docker compose up -d db      # o tu Postgres local
npx prisma migrate dev
npm run prisma:seed
```

## Cómo arrancar en desarrollo

1. Copiar `.env.example` a `.env` en la raíz y en `apps/web`, y completar los secretos de JWT.
2. Levantar todo con Docker Compose:

   ```bash
   docker compose up
   ```

   - API: http://localhost:3000/api
   - Swagger: http://localhost:3000/api/docs
   - Web: http://localhost:5173

3. Correr las migraciones y el seed (primera vez, o cuando cambie el schema):

   ```bash
   cd apps/api
   npx prisma migrate dev
   npm run prisma:seed
   ```

4. Usuarios de prueba (creados por el seed):

   | Email | Contraseña |
   |---|---|
   | nahuel@climarte.com.ar | climarte2026 |
   | adrian@climarte.com.ar | climarte2026 |

   *(Cambiar estas contraseñas antes de ir a producción.)*

## Sin Docker (alternativa)

```bash
npm install --workspace=apps/api
npm install --workspace=apps/web

# Backend
cd apps/api && npm run start:dev

# Frontend (en otra terminal)
cd apps/web && npm run dev
```

## Sprint actual

**Sprint 4 — Gastos, Vehículo y Herramientas** (por arrancar). Entidades previstas: `GastoFijo`, `GastoVariable`, `CategoriaGasto`, `Proveedor`, `Vehiculo`, `RegistroCombustible`, `RegistroService`, `Herramienta`.

Ver `docs/sprints/sprint-4.md` y `docs/04 - Plan de Desarrollo y MVP.md`, sección 3.
