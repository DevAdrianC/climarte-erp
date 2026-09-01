# Sprint 4 — Gastos, Vehículo y Herramientas

**Estado:** 🔜 En curso
**Referencia:** `docs/04 - Plan de Desarrollo y MVP.md` §3
**Depende de:** [sprint-1.md](sprint-1.md) (auth), [sprint-3.md](sprint-3.md) (para asociar gastos/combustible a un trabajo, opcional)

## Objetivos

Cubrir todos los gastos del emprendimiento que no dependen de un trabajo puntual (gastos fijos y variables generales), más los que sí pueden asociarse a uno (combustible, mano de obra externa ya cubierta en Sprint 3), y llevar registro del vehículo (combustible, service) y de las herramientas/equipos del negocio.

## Alcance

### Backend

**Módulo Gastos** (`apps/api/src/modules/gastos/`)

- `GastoFijo`: gasto recurrente con periodicidad (mensual) y categoría. CRUD básico (alta, listado, edición).
- `GastoVariable`: gasto puntual con categoría, proveedor opcional y `trabajoId` opcional.
  - Si tiene `trabajoId` → se considera costo directo asociado a ese trabajo.
  - Si no tiene `trabajoId` → se considera gasto general del negocio.
- `CategoriaGasto`: catálogo simple (listado; alta opcional según necesidad real).
- `Proveedor`: catálogo simple (nombre, contacto), reutilizable entre gastos.

**Módulo Vehículo** (`apps/api/src/modules/vehiculo/`)

- `Vehiculo`: entidad base (marca, modelo, patente) — probablemente un único registro por ahora, pero modelado para soportar más de uno a futuro.
- `RegistroCombustible`: fecha, litros o importe, `trabajoId` opcional (si no tiene trabajo asociado, es gasto general del vehículo).
- `RegistroService`: fecha, descripción, importe total, `porcentajeAtribuido` configurable por evento, con cálculo de `importeAtribuido = importeTotal * (porcentajeAtribuido / 100)`.

**Módulo Herramientas** (`apps/api/src/modules/herramientas/`)

- `Herramienta`: alta, listado, edición (nombre, categoría/tipo, fecha de compra, importe, estado — activa/dada de baja).

**Endpoints**

- `GET/POST /api/gastos-fijos`, `PATCH /api/gastos-fijos/:id`
- `GET/POST /api/gastos-variables`, `PATCH /api/gastos-variables/:id`
- `GET /api/categorias-gasto` (y `POST` si se decide habilitar alta desde la UI)
- `GET/POST /api/proveedores`
- `GET/POST /api/vehiculos/:id/combustible`
- `GET/POST /api/vehiculos/:id/service`
- `GET/POST /api/herramientas`, `PATCH /api/herramientas/:id`

### Frontend

- `GastosPage`: listado combinado o con tabs (fijos / variables), con filtro por categoría y por si está o no asociado a un trabajo.
- `GastoForm`: alta/edición de gasto fijo o variable, con selector de trabajo opcional (búsqueda por cliente o número de trabajo).
- `VehiculoPage`: dos secciones — historial de combustible e historial de service, con alta rápida desde la misma pantalla.
- `HerramientasPage`: listado con alta/edición, sin pantalla de detalle separada (no lo amerita el volumen esperado).

### Fuera de alcance

- Reportes o gráficos de gastos por período — eso es Sprint 6 (Dashboard) y Sprint 7 (Reportes).
- Vinculación de gastos a la Liquidación mensual — eso lo consume Sprint 5, este sprint solo deja los datos disponibles.
- Alta de categorías de gasto desde la UI si no surge la necesidad real (puede quedar seedeada por ahora).
- Gestión de mantenimiento preventivo o alertas de vencimiento de service — solo registro histórico, sin automatización.

## Tareas

- [ ] Modelar entidades en `schema.prisma`: `GastoFijo`, `GastoVariable`, `CategoriaGasto`, `Proveedor`, `Vehiculo`, `RegistroCombustible`, `RegistroService`, `Herramienta`.
- [ ] Migración de Prisma + seed mínimo (al menos un vehículo y categorías base).
- [ ] Módulo `gastos`: DTOs, service, controller, tests de la regla costo-directo-vs-gasto-general.
- [ ] Módulo `vehiculo`: DTOs, service, controller, cálculo de `importeAtribuido` en service.
- [ ] Módulo `herramientas`: DTOs, service, controller.
- [ ] Frontend: `GastosPage` + `GastoForm`.
- [ ] Frontend: `VehiculoPage` (combustible + service).
- [ ] Frontend: `HerramientasPage`.
- [ ] Actualizar Swagger con los nuevos endpoints (automático vía decoradores, pero verificar).
- [ ] Actualizar README (tabla de estado, "implementado a hoy") al cerrar el sprint.

## Criterios de aceptación

- [ ] Un gasto fijo se carga con categoría e importe mensual.
- [ ] Un gasto variable puede o no asociarse a un trabajo, y eso determina si es costo directo o gasto general.
- [ ] El combustible sin trabajo asociado queda como gasto general del vehículo.
- [ ] El % de service es editable por evento y calcula correctamente el importe atribuido.
- [ ] Tests: distinción correcta costo directo vs. gasto general según presencia de `trabajoId`; cálculo de `importeAtribuido` del service.

## Estado

| Fecha      | Nota                                                         |
| ---------- | ------------------------------------------------------------ |
| 2026-08-31 | Alcance definido y aprobado. Arranca implementación backend. |
