# Sprint 5 — Ingresos y Liquidación mensual

**Estado:** 🔜 Por arrancar
**Referencia:** `docs/04 - Plan de Desarrollo y MVP.md` §3 (Sprint 5); `docs/02 - Especificación Funcional.md` §9
**Depende de:** [sprint-3.md](sprint-3.md) (Trabajos), [sprint-4.md](sprint-4.md) (Gastos, para costos directos con `pagadoPor`)

## Objetivos

El corazón económico del sistema: poder registrar el cobro de un trabajo y saber, en cualquier momento, cuánto le corresponde a cada socio.

## Alcance

### Backend — Ingresos (`apps/api/src/modules/ingresos/`)

- `Ingreso`: registro de cobro de un trabajo, criterio **percibido** (se registra cuando efectivamente se cobra, no cuando se factura). Campos: `trabajoId`, `importe`, `fecha`, `formaPago` opcional.
- Un trabajo puede tener múltiples ingresos (cobro parcial + saldo, por ejemplo).
- Al registrar un ingreso, actualizar `estadoPago` del trabajo: `PARCIAL` si la suma de ingresos < `precioFinal`, `COBRADO` si la suma ≥ `precioFinal`.
- Solo se puede registrar un ingreso sobre un trabajo con `estadoOperativo = FINALIZADO` (tiene que tener `precioFinal` fijado).

### Backend — Retiros de socios (`apps/api/src/modules/retiros/`)

- `RetiroSocio`: `socioId`, `importe`, `fecha`, `concepto` opcional, `observaciones` opcional, `creadoPorId`.
- Alta y listado (filtrable por socio y por período).

### Backend — Liquidación (`apps/api/src/modules/liquidacion/`)

Este es el módulo con la regla de negocio crítica. Para un período dado (`YYYY-MM`), calcula:

1. **Ganancia por mano de obra propia** = Σ Ingresos del período − Σ Costos directos de esos trabajos (materiales, transporte, mano de obra externa, otros). Se reparte **50/50** entre los socios según `ConfiguracionParticipacion` vigente en el período.
2. **Reembolsos** = Σ Costos directos del período, agrupados por `pagadoPor`. Se devuelven **enteros** a quien pagó — **nunca se reparten 50/50**.
3. **Retiros ya realizados** = Σ `RetiroSocio` del período, por socio.
4. **Saldo pendiente por socio** = (Ganancia 50/50 que le corresponde + Reembolsos que le corresponden) − Retiros ya realizados.

> ⚠️ **Regla no negociable** (Parte 2 §9): los puntos 1 y 2 son conceptualmente distintos y **no deben mezclarse en el código**. La ganancia se reparte por porcentaje societario; los reembolsos se asignan 100% a quien pagó. Un error acá significa que un socio cobra de más o de menos con dinero real.

### Endpoints

- `POST /api/trabajos/:id/ingresos` — registrar cobro.
- `GET /api/trabajos/:id/ingresos` — listado de cobros de un trabajo.
- `POST /api/retiros`, `GET /api/retiros?socioId=&periodo=`
- `GET /api/liquidacion?periodo=YYYY-MM` — devuelve los 4 componentes por socio.

### Frontend

- Registro de cobro embebido en `TrabajoDetallePage` (similar a como ya se cargan costos/participantes).
- `LiquidacionPage`: selector de período (mes/año) + tabla con los 4 componentes por socio (ganancia 50/50, reembolsos, retiros, saldo pendiente).
- `RetiroForm`: alta de retiro (socio, importe, fecha, concepto).

### Fuera de alcance

- Gastos generales del negocio (fijos/variables, sin `pagadoPor` de un trabajo) — se restan del resultado neto del emprendimiento, pero **no** entran en el cálculo de reembolsos por trabajo. Ver Dashboard (Sprint 6) para el resultado neto general.
- Cierre formal de mes / bloqueo de edición de períodos pasados — no está definido en el plan, se evalúa en un sprint posterior si se necesita.
- Facturación o comprobantes fiscales — fuera del MVP.

## Tareas

- [ ] Modelar `Ingreso` y `RetiroSocio` en `schema.prisma` + migración.
- [ ] Módulo `ingresos`: DTO, service (con actualización de `estadoPago`), controller.
- [ ] Módulo `retiros`: DTO, service, controller.
- [ ] Módulo `liquidacion`: service con el cálculo de los 4 componentes, controller.
- [ ] **Tests del cálculo de liquidación** (prioridad crítica según el plan): casos verificados a mano con números de ejemplo.
- [ ] Test: la mano de obra de los socios nunca aparece como `CostoTrabajo` (reafirmar la regla ya probada en Sprint 3, ahora también desde el cálculo de liquidación).
- [ ] Test: los reembolsos por `pagadoPor` no se reparten 50/50 en ningún escenario.
- [ ] Frontend: registro de cobro en `TrabajoDetallePage`.
- [ ] Frontend: `LiquidacionPage` con selector de período.
- [ ] Frontend: `RetiroForm`.
- [ ] Actualizar README al cerrar el sprint.

## Criterios de aceptación

- [ ] Un trabajo `FINALIZADO` puede cobrarse (total o parcial), y su `estadoPago` se actualiza automáticamente.
- [ ] La Liquidación mensual muestra correctamente los 4 componentes definidos en Parte 2 §9.
- [ ] El cálculo nunca reparte 50/50 los reembolsos, ni al revés reparte por `pagadoPor` la ganancia por mano de obra.
- [ ] El saldo pendiente por socio refleja correctamente los retiros ya realizados.

## Estado

| Fecha | Nota |
| ----- | ---- |
|       |      |
