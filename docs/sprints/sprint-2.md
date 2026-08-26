# Sprint 2 — Clientes

**Estado:** ✅ Completo
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
- Historial de trabajos del cliente, ordenado del más reciente al más viejo (conectado al modelo `Trabajo` una vez que el Sprint 3 lo creó).
- Todo el controller protegido por `JwtAuthGuard` + `RolesGuard`.

### Frontend (`apps/web/src/pages/clientes/`)

- `ClientesPage`: listado con buscador.
- `ClienteForm`: formulario de alta/edición (usado dentro de `Modal`).
- `ClienteDetallePage`: ficha del cliente con la tabla del historial de trabajos (fecha, servicio, estados y precio, con link al detalle de cada trabajo).
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

`apps/api/src/modules/clientes/clientes.service.spec.ts`:

- El historial devuelve los trabajos del cliente filtrados por `clienteId` y ordenados por fecha descendente.
- Si el cliente no existe, lanza `NotFoundException` sin llegar a consultar trabajos.

El alta, la edición y la búsqueda todavía no tienen cobertura automatizada.

## Historial de la ficha (cerrado)

`ClientesService.historialDeTrabajos()` devolvía un array vacío hardcodeado mientras el modelo `Trabajo` no existía. Quedó conectado después del Sprint 3: hoy consulta `Trabajo` por `clienteId` con sus catálogos. Ver [sprint-3.md](sprint-3.md).
