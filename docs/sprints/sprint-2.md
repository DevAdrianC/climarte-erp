# Sprint 2 — Clientes

**Estado:** ✅ Completo (con 1 pendiente heredado, ver abajo)
**Referencia:** `docs/04 - Plan de Desarrollo y MVP.md` §3
**Depende de:** [sprint-1.md](sprint-1.md) (auth)

> Reconstruido a partir del código, las migraciones de Prisma y los tests existentes.

## Objetivos

Tener una base de clientes operativa antes de poder cargar trabajos.

*(Leads quedó fuera del MVP por decisión del plan — pasa a v1.1.)*

## Alcance

### Backend (`apps/api/src/modules/clientes/`)

- `ClientesModule` / `ClientesController` / `ClientesService`.
- Alta y edición con DTOs validados: `crear-cliente.dto.ts`, `actualizar-cliente.dto.ts`.
- Búsqueda por texto libre sobre nombre, teléfono o localidad (`contains`, case-insensitive), ordenada por nombre.
- Obtención por id con `NotFoundException` explícita; la edición valida existencia antes de actualizar.
- Endpoint de historial de trabajos del cliente, previsto para conectarse en el Sprint 3.
- Todo el controller protegido por `JwtAuthGuard` + `RolesGuard`.

### Frontend (`apps/web/src/pages/clientes/`)

- `ClientesPage`: listado con buscador.
- `ClienteForm`: formulario de alta/edición (usado dentro de `Modal`).
- `ClienteDetallePage`: ficha del cliente con el espacio del historial de trabajos.
- `clientes.api.ts`: capa de acceso a la API.

## Entidades

`Cliente` — campos: `nombre` y `telefono` obligatorios; `whatsapp`, `direccion`, `localidad`, `observaciones` opcionales.

Tabla `clientes` creada en la migración `20260816020631_agregar_clientes`. La relación `Cliente 1—N Trabajo` se agrega recién en el Sprint 3.

## Endpoints

- `POST /api/clientes`
- `GET /api/clientes?q=`
- `GET /api/clientes/:id`
- `PATCH /api/clientes/:id`
- `GET /api/clientes/:id/trabajos`

## Tests

No hay tests unitarios propios de este módulo en el repositorio. La cobertura automatizada del sprint quedó pendiente.

## Pendiente heredado

`ClientesService.historialDeTrabajos()` devuelve un array vacío hardcodeado. Era correcto mientras el modelo `Trabajo` no existía, pero el Sprint 3 lo creó y este método nunca se conectó. Hoy la ficha de cliente muestra el historial siempre vacío. Ver [sprint-3.md](sprint-3.md).
