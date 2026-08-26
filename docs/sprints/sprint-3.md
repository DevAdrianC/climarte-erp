# Sprint 3 — Trabajos

**Estado:** ✅ Completo
**Referencia:** `docs/04 - Plan de Desarrollo y MVP.md` §3
**Depende de:** [sprint-1.md](sprint-1.md) (auth), [sprint-2.md](sprint-2.md) (clientes)

> Reconstruido a partir del código, las migraciones de Prisma y los tests existentes.

## Objetivos

El núcleo operativo del sistema: registrar un trabajo de punta a punta, desde la consulta hasta la finalización, sin sprint separado de presupuestos (el ciclo comercial y el operativo van juntos).

## Alcance

### Backend — Trabajos (`apps/api/src/modules/trabajos/`)

- Alta de trabajo con cliente, tipo de equipo, tipo de servicio, fecha, descripción, precio presupuestado, forma de pago, garantía y observaciones. Registra `creadoPorId` desde el JWT.
- Listado con filtros por `estadoComercial`, `estadoOperativo` y `clienteId`, ordenado por fecha descendente.
- Detalle con `include` completo: cliente, catálogos, participantes (usuario o colaborador externo) y costos (con quién los pagó).
- **Tres estados independientes entre sí**, cada uno con su propio endpoint de transición:
  - `estadoComercial`: CONSULTA / PRESUPUESTO / PRESUPUESTO_ENVIADO / APROBADO / RECHAZADO
  - `estadoOperativo`: PROGRAMADO / EN_EJECUCION / FINALIZADO / CANCELADO
  - `estadoPago`: PENDIENTE / PARCIAL / COBRADO
- Finalización: endpoint dedicado que fija `precioFinal` (puede diferir del presupuestado) y pasa el estado operativo a FINALIZADO.
- Validación dura: no se puede pasar a FINALIZADO por el endpoint genérico de estado operativo si no hay `precioFinal`.
- Participantes: alta y baja, con roles RESPONSABLE / PARTICIPANTE / COLABORADOR_EXTERNO, horas dedicadas opcionales, y validación cruzada de que un colaborador externo requiere `colaboradorExternoId` y un socio requiere `usuarioId`.
- Costos: alta y baja, con tipo (MATERIALES / TRANSPORTE / MANO_OBRA_EXTERNA / OTRO), importe, `pagadoPor` opcional y URL de comprobante. Borrado en cascada al eliminar el trabajo.
- Garantía: 90 días por defecto, con observaciones libres.

### Backend — Catálogos (`apps/api/src/modules/catalogos/`)

Módulo de apoyo creado en este sprint para alimentar los selects del formulario de trabajo:

- `GET` de tipos de servicio, tipos de equipo, colaboradores externos y usuarios activos.
- `POST` de colaborador externo (`crear-colaborador-externo.dto.ts`).

### Frontend (`apps/web/src/pages/trabajos/`)

- `TrabajosPage`: listado con filtros por estado.
- `TrabajoForm`: alta/edición.
- `TrabajoDetallePage`: detalle con cambio de estados, participantes y costos cargables desde la misma pantalla.
- `AgregarParticipanteForm`, `AgregarCostoForm`: formularios embebidos.
- `estados.helpers.ts`: etiquetas y colores de los tres estados; `Badge.tsx` como componente de presentación.

## Entidades

`Trabajo`, `TrabajoParticipante`, `CostoTrabajo`, `ColaboradorExterno`, `TipoServicio`, `TipoEquipo`.

Enums: `EstadoComercial`, `EstadoOperativo`, `EstadoPago`, `RolEnTrabajo`, `TipoCosto`.

Migración: `20260816183125_agregar_trabajos`.

## Endpoints

- `POST /api/trabajos`, `GET /api/trabajos?estadoComercial=&estadoOperativo=&clienteId=`, `GET /api/trabajos/:id`
- `PATCH /api/trabajos/:id/estado-comercial`
- `PATCH /api/trabajos/:id/estado-operativo`
- `PATCH /api/trabajos/:id/finalizar`
- `POST /api/trabajos/:id/participantes`, `DELETE /api/trabajos/:id/participantes/:participanteId`
- `POST /api/trabajos/:id/costos`, `DELETE /api/trabajos/:id/costos/:costoId`
- `GET /api/catalogos/*` (tipos de servicio, tipos de equipo, colaboradores externos, usuarios)

## Reglas no negociables verificadas

1. **Participar de un trabajo nunca modifica la participación societaria.** `TrabajoParticipante` no tiene ninguna relación con `ConfiguracionParticipacion`, y hay tests que fallan si el servicio llegara a tocar esa tabla.
2. **La mano de obra de los socios nunca es un costo.** El enum `TipoCosto` no incluye ningún valor para eso, por diseño.
3. **No se finaliza un trabajo sin precio final.**

## Tests

`apps/api/src/modules/trabajos/trabajos.service.spec.ts`:

- Agregar un participante nunca llama a `configuracionParticipacion.create` ni `.updateMany`.
- Agregar un colaborador externo tampoco toca la participación societaria.
- No permite finalizar un trabajo sin `precioFinal`.

## Pendiente detectado

El modelo `Trabajo` ya tiene la relación con `Cliente`, pero `ClientesService.historialDeTrabajos()` sigue devolviendo `[]` hardcodeado (stub del Sprint 2). Conectarlo es trabajo residual de este sprint.
