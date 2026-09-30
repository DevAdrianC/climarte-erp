# Sprint 6 — Dashboard

**Estado:** 🔜 Por arrancar
**Referencia:** `docs/04 - Plan de Desarrollo y MVP.md` §3 (Sprint 6); `docs/02 - Especificación Funcional.md` §12
**Depende de:** sprint-3 (Trabajos), sprint-4 (Gastos), sprint-5 (Ingresos y Liquidación)

## Objetivos

Dar visibilidad diaria de la operación sin entrar a cada módulo. Sin entidades nuevas.

## Decisión de alcance (importante)

El Dashboard usa el **mismo criterio que Liquidación** (Sprint 5) para "costos directos": solo `CostoTrabajo`. Los gastos variables y cargas de combustible asociados a un `trabajoId` (Sprint 4) **no** se suman ahí, para no tocar el cálculo de Liquidación ya probado con tests y datos reales. Se muestran aparte, como línea informativa separada ("Gastos asociados a trabajos, fuera de la Liquidación"), dejando explícito que no impactan el reparto societario. Si más adelante se decide unificarlos, es un cambio de alcance deliberado en un sprint propio, no un efecto colateral del Dashboard.

## Alcance

### Backend — `apps/api/src/modules/dashboard/`

`GET /api/dashboard/resumen?periodo=YYYY-MM` devuelve:

- Ingresos del mes: Σ `Ingreso.importe` con fecha en el período.
- Costos directos: Σ `CostoTrabajo` de los trabajos cobrados en el período (idéntico criterio a `LiquidacionService`, para que las cifras coincidan entre pantallas).
- Gastos generales del mes: gastos fijos activos + gastos variables sin `trabajoId` + combustible sin `trabajoId` + `importeAtribuido` de services.
- Gastos asociados a trabajos (informativo, fuera del resultado): Σ gastos variables y combustible **con** `trabajoId` del período. Se muestra aparte, no se resta del resultado ni entra en Liquidación.
- Desglose gastos fijos / variables.
- Resultado = Ingresos − Costos directos − Gastos generales.
- Trabajos finalizados en el período / trabajos pendientes (programados o en ejecución).
- Presupuestos pendientes (estado comercial PRESUPUESTO o PRESUPUESTO_ENVIADO).
- Dinero pendiente de cobro: Σ `precioFinal` de trabajos finalizados − Σ ingresos de esos trabajos.
- Resultado estimado por socio: reutiliza `LiquidacionService.calcular()`, sin duplicar la fórmula.
- Inversión en publicidad: fijo en $0 (Campañas no está en el MVP).

### Frontend

- Reemplazar el contenido de `DashboardPage` con los indicadores de arriba, con selector de período (mismo componente `type="month"` que ya se usa en `LiquidacionPage`).
- Mantener el bloque actual de participación societaria.
- La línea de "gastos asociados a trabajos" se muestra con una aclaración visible de que es informativa y no está incluida en el resultado ni en la Liquidación.

### Fuera de alcance

- Gráficos históricos, comparativas entre meses, exportaciones (Sprint 7).
- Unificar el criterio de costos directos entre Gastos y Liquidación (decisión pendiente, no es parte de este sprint).

## Tareas

- [ ] `DashboardService.resumen(periodo)`, reutilizando `LiquidacionService` para el resultado por socio.
- [ ] Controller y módulo.
- [ ] Tests: costos directos coinciden con los de Liquidación; gastos asociados a trabajos quedan separados y no afectan el resultado.
- [ ] Frontend: `DashboardPage` con indicadores y selector de período.
- [ ] Actualizar README al cerrar.

## Criterios de aceptación

- [ ] Todos los indicadores de Parte 2 §12 se muestran para el período elegido.
- [ ] Ingresos, costos directos y ganancia coinciden exactamente con los de la pantalla de Liquidación para el mismo período.
- [ ] Los gastos asociados a trabajos aparecen por separado, claramente marcados como no incluidos en el resultado.

**Estado:** ✅ Completo
| 2026-09-28 | Sprint cerrado. Dashboard verificado: ingresos y costos directos coinciden exactamente con Liquidación. Gastos asociados a trabajos correctamente separados del resultado. Datos de septiembre son de prueba; carga real arranca en octubre. |
