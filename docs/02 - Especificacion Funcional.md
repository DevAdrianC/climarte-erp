# CLIMARTE ERP — Especificación Funcional (Parte 2)

### Software Functional Specification

**Fuente exclusiva de este documento**: *"CLIMARTE ERP — Análisis y Arquitectura (Parte 1)"*, ya validada y aprobada. No se modifica ninguna decisión tomada allí. No se inventan reglas económicas, porcentajes ni procesos nuevos. Todo lo que la Parte 1 no cubre queda marcado como:

> ⚠️ **PENDIENTE DE DEFINICIÓN**

con la decisión concreta que hace falta tomar y, cuando corresponde, alternativas para elegir.

---

## 1. Estructura general — módulos funcionales

| # | Módulo | Fuente en Parte 1 |
|---|---|---|
| 1 | Autenticación y Usuarios | §1.1, §5, §21 |
| 2 | Clientes y Leads | §1.2, §14, §15 |
| 3 | Trabajos | §1.3, §3, §4 |
| 4 | Presupuestos | §1.3, §4 *(⚠️ ver 4.1 — no es una entidad separada en Parte 1)* |
| 5 | Gastos (fijos, variables, costos directos) | §1.4, §7 |
| 6 | Transporte | §1.6, §8 |
| 7 | Caja y Movimientos | §1.6 *(⚠️ ver 7 — parcialmente definido)* |
| 8 | Socios y Participación | §1.1, §12 |
| 9 | Distribución de Resultados / Liquidación mensual | §1.6, §11, §12 |
| 10 | Administración | §9 (raíz) *(⚠️ ver 10 — no formalizado como entidad)* |
| 11 | Marketing y Comercial | §1.2, §16 |
| 12 | Dashboard | §17 |
| 13 | Reportes | §11, §17, §18 |
| 14 | Futura venta de insumos | §1.5, §13 |
| 15 | Colaboradores y crecimiento | §1.3, §4, §18 |
| 16 | Roles y Permisos | §5, §21 |
| 17 | Auditoría | §1.7, §22 |
| 18 | Automatizaciones futuras (n8n) | §7, §19 |

No se agregan módulos que la Parte 1 no sugiere (por ejemplo, no hay módulo de "facturación electrónica" ni de "RRHH completo" — quedan mencionados como fuera de alcance).

---

## 2. Módulo de Clientes

**Objetivo**: mantener una base única de clientes y su historial de trabajos.

**Usuarios**: Admin/Socio (ambos, acceso completo). Futuro: rol Administrativo.

**Información que administra** (Parte 1 §14): nombre, teléfono, WhatsApp, dirección, localidad, observaciones, historial de trabajos.

**Funcionalidades principales**
- Alta, edición y consulta de cliente.
- Listado de clientes con búsqueda por nombre/teléfono/localidad.
- Ficha de cliente con historial completo de trabajos asociados (responde la pregunta "¿qué trabajos hicimos antes a este cliente?", Parte 1 §14).
- Un cliente puede tener múltiples trabajos (relación 1─N, ya definida en el diagrama de la Parte 1).

**Relación con otros módulos**: Trabajos (1─N), Leads (un Lead se convierte en Cliente al aprobarse un presupuesto — ver módulo 11).

**Diferencia Cliente vs. Lead**: la Parte 1 (§14) es explícita en que deben ser conceptos distintos. Un **Lead** (`LeadContacto`) es un contacto potencial sin trabajo confirmado todavía; se convierte en **Cliente** cuando hay al menos un trabajo aprobado. El Cliente no tiene campo de "canal de origen" propio — ese dato vive en el Lead que le dio origen (ver módulo 11).

**Reglas de negocio**: ninguna regla económica involucrada en este módulo. Es puramente registro y consulta.

---

## 3. Módulo de Trabajos

**Objetivo**: registrar cada trabajo realizado por CLIMARTE, su ejecución, sus costos y su resultado — es el núcleo operativo del sistema (Parte 1 §3, §4).

**Usuarios**: Admin/Socio (alta, edición completa). Futuro: Técnico (solo estado operativo de sus trabajos asignados), Administrativo (presupuestos, estados comerciales).

### 3.1 Datos del trabajo (Parte 1 §3, §1.3)

`id, cliente_id, fecha, tipo_equipo, tipo_servicio, descripción, responsable/participantes, precio_presupuestado, precio_final, forma_pago, observaciones, creado_por, creado_en`

### 3.2 Estados — separados en tres campos independientes (✅ DEFINIDO, incluidos los valores exactos)

La Parte 1 aprobó separar el viejo campo único "estado" en tres, para poder responder preguntas como "¿cuántos trabajos finalizados están sin cobrar?" sin ambigüedad. Los valores exactos de cada lista ya están confirmados:

| Campo | Valores confirmados |
|---|---|
| `estado_comercial` | Consulta → Presupuesto → Presupuesto enviado → Aprobado → Rechazado |
| `estado_operativo` | Programado → En ejecución → Finalizado → Cancelado |
| `estado_pago` | Pendiente → Parcial → Cobrado |

Los tres estados son configurables desde el sistema, tal como pedía el requerimiento original.

### 3.3 Flujo del trabajo

```
Consulta → Presupuesto → Presupuesto enviado → Aprobado
                                                   │
                                                   ▼
                                            Programado → En ejecución → Finalizado
                                                                            │
                                                                            ▼
                                                              Cobro (estado_pago → Cobrado)
```

El `precio_final` se define recién al finalizar el trabajo (Parte 1 §8, punto 4 — ya **definido**), porque puede variar respecto al `precio_presupuestado` por trabajos agregados en el momento (ej. capacitor roto, carga de gas). El `Ingreso` asociado se registra en **criterio percibido**: cuando efectivamente se cobra, con fecha propia que puede no coincidir con la fecha de finalización.

### 3.4 Participantes: individual, conjunto o con colaborador externo

Vía `TrabajoParticipante` (Parte 1 §1.3), cada trabajo puede tener uno o varios de:
- Nahuel como responsable único.
- Adrián como responsable único.
- Ambos como participantes (trabajo conjunto).
- Uno o ambos + un colaborador externo (`rol_en_trabajo = colaborador_externo`).

**Regla de negocio (no negociable, Parte 1 §4, §23)**: quién participó en el trabajo **nunca** modifica automáticamente la participación societaria 50/50. Esto es productividad individual, un dato distinto y separado.

### 3.5 Costos del trabajo

Vía `CostoTrabajo` (Parte 1 §1.3, §1.6 — ya **definido**), tipos: `materiales`, `transporte`, `mano_obra_externa`, `otro`. Cada costo tiene `pagado_por` (opcional) para saber qué socio lo adelantó de su bolsillo, usado en la Liquidación mensual (módulo 9).

**La mano de obra de los socios NO aparece como costo** — es la ganancia del trabajo y se reparte 50/50 (ver módulo 9 para el detalle completo).

### 3.6 Garantía

✅ **DEFINIDO**: CLIMARTE entrega trabajos con **3 meses de garantía** por defecto. Se agrega a `Trabajo` el campo `garantia_dias` (valor por defecto: 90) y `garantia_observaciones` (texto libre, por si un trabajo puntual tiene una garantía distinta o excepciones). El sistema puede calcular automáticamente la fecha de vencimiento de garantía (`fecha_finalizacion + garantia_dias`) para futuros avisos al cliente o al equipo.

### 3.7 Relación con otros módulos

Cliente (N─1), Presupuesto (mismo registro, ver módulo 4), Gastos/Costos (1─N), Ingresos (1─N), Marketing/Leads (un trabajo puede originarse de un Lead convertido).

---

## 4. Módulo de Presupuestos

### 4.1 ✅ DEFINIDO — Opción A confirmada: estado del Trabajo, sin entidad separada

Confirmado: el presupuesto **no** es una entidad independiente. El `Trabajo` nace en `estado_comercial = Consulta` y evoluciona a `Presupuesto → Presupuesto enviado → Aprobado`, con los campos `precio_presupuestado` y `precio_final` dentro del mismo registro. Si en el futuro CLIMARTE necesita manejar varias versiones de presupuesto por pedido, se evalúa migrar a una entidad separada (Opción B), pero no forma parte del diseño actual.

### 4.2 Qué sucede cuando un presupuesto es aprobado

Con la Opción A: cambiar `estado_comercial` a `Aprobado` habilita que el trabajo pase a `estado_operativo = Programado`. No hay "creación" de un nuevo registro — es el mismo Trabajo avanzando de estado. Esto es consistente con lo que pide el requerimiento original ("Presupuesto aprobado → creación o activación del trabajo correspondiente"): la "activación" es el cambio de estado operativo.

---

## 5. Módulo de Gastos

**Objetivo**: separar con claridad costo directo de trabajo vs. gasto general del emprendimiento (Parte 1 §7, punto fundamental para la rentabilidad real).

### 5.1 Gastos fijos (Parte 1 §1.4, §6)

`categoria, importe, periodicidad (mensual), fecha`. Ejemplo ya confirmado: alquiler $500.000/mes. Categorías configurables (alquiler, servicios, internet, software, publicidad, suscripciones, otros).

### 5.2 Gastos variables (Parte 1 §1.4, §7)

`categoria, importe, fecha, proveedor (opcional), trabajo_id (opcional), medio_pago, pagado_por (opcional)`. El campo `trabajo_id` opcional es exactamente lo que distingue **costo directo de un trabajo** de **gasto general** — si tiene `trabajo_id`, es costo directo; si no, es gasto general.

### 5.3 Costos directos de trabajos

Son los registrados en `CostoTrabajo` dentro del módulo Trabajos (ver 3.5): materiales, transporte, mano de obra externa, otros — siempre ligados a un `trabajo_id`.

### 5.4 Comprobante

✅ **DEFINIDO**: no es obligatorio, pero queda disponible como campo **opcional** (`comprobante_url` o adjunto) en `GastoFijo`/`GastoVariable`/`CostoTrabajo`, útil para gastos grandes donde convenga tener respaldo del precio pagado.

### 5.5 Responsable del gasto

El "responsable" de un gasto, en términos de la Parte 1, es quién lo cargó al sistema (`creado_por`, vía auditoría) y, cuando aplica, quién lo pagó de su bolsillo (`pagado_por`, para el reembolso). No hay un concepto adicional de "responsable" más allá de estos dos.

---

## 6. Módulo de Transporte

**Objetivo**: implementar únicamente el criterio aprobado en la Parte 1, sin kilometraje ni depreciación (Parte 1 §8, §1.4, §1.6).

### 6.1 Traslado personal al taller

**No se registra en el sistema.** La Parte 1 es explícita: no se quiere un sistema de kilometraje para este traslado. No hay entidad ni campo asociado.

### 6.2 Uso laboral de la camioneta — transporte por trabajo

Ya **definido** (Parte 1 §8, punto 2): se carga como `CostoTrabajo` tipo `transporte`, con un monto elegido en el momento según cuántos viajes hizo falta (domicilio, ida a buscar materiales), de una escala simple: **$5.000 / $10.000 / $15.000**. `pagado_por` indica quién puso la plata para reembolso en la liquidación mensual.

**Mejora marcada para el futuro** (no MVP): cálculo automático por kilómetros, usando consumo promedio del vehículo y precio de combustible del día. Cuando se implemente, `Vehiculo` sumará `consumo_promedio_km_por_litro`.

### 6.3 Combustible general (no ligado a un trabajo puntual)

✅ **DEFINIDO**: si el combustible no se puede asociar a un trabajo puntual (ej. viaje a comprar materiales para varios trabajos, o un viaje administrativo), queda registrado como gasto general del vehículo — `RegistroCombustible.trabajo_id` queda vacío en esos casos, sin necesidad de repartirlo entre trabajos del día.

### 6.4 Service de la camioneta

Ya definido en Parte 1 §8: 30%–50% del costo del service atribuible al emprendimiento, **configurable por evento** (no un valor fijo global). Queda **⚠️ PENDIENTE DE DEFINICIÓN** (Parte 1 §8, punto 6) quién decide el % exacto en cada caso — se recomienda que quede editable por evento y trazado en Auditoría.

---

## 7. Módulo de Caja y Movimientos

### 7.1 ✅ DEFINIDO — Opción A confirmada: reporte derivado, sin cuenta común

Confirmado: **no existe** una cuenta/billetera común de CLIMARTE — el dinero siempre transita por las cuentas personales de los socios. Por lo tanto, "Caja y Movimientos" **no es una tabla nueva**, sino un **reporte derivado** que se calcula sumando Ingresos − Gastos − Reembolsos pendientes para un período dado, construido a partir de los módulos que ya existen (Ingresos, Gastos, Liquidación mensual). Esto es consistente con el criterio general de la Parte 1 de no crear un sistema contable complejo desde el inicio.

Diferencia dinero del emprendimiento de movimientos personales de la misma forma en que ya lo hace el resto del sistema: todo lo que no tiene `trabajo_id` ni pertenece a `GastoFijo`/`GastoVariable`/`Ingreso` del emprendimiento, simplemente no existe en el sistema (no se modela gasto personal).

---

## 8. Módulo de Socios

**Objetivo**: documentar de forma auditable la estructura societaria y diferenciarla de aportes y productividad (Parte 1 §1, §23 — principio central de todo el sistema).

**Estructura**: Nahuel 50% / Adrián 50%, vía `ConfiguracionParticipacion` versionada (Parte 1 §1.1, §12) — permite cambiar el porcentaje en el futuro sin alterar el historial ni trabajos ya cerrados.

**Aportes registrados** (informativos, no societarios — Parte 1 §1, §9, §23): herramientas y conocimiento técnico (Nahuel), documentación/administración/marketing (Adrián). Estos aportes se pueden vincular a los módulos correspondientes (Herramientas, Marketing, Administración) pero **nunca generan un cálculo automático de porcentaje adicional**.

**Regla no negociable**: participación societaria, productividad individual y aportes de recursos son tres variables separadas en el sistema, tal como exige la Parte 1 §23.

---

## 9. Distribución de Resultados / Liquidación mensual

Módulo definido en detalle en la Parte 1 §1.6 (a partir de tus aclaraciones) — se resume aquí en términos funcionales:

**Qué muestra, por período:**
1. **Ganancia por mano de obra propia** (Ingresos de trabajos − costos directos: materiales, transporte, mano de obra externa, otros) → repartida 50/50 entre Nahuel y Adrián.
2. **Reembolsos**: total de costos directos agrupados por quién los pagó (`pagado_por`) → se devuelven enteros a quien los adelantó, **no** se reparten 50/50.
3. **Saldo neto a transferir** entre los socios para que ambos terminen parejos, combinando 1 y 2.

**No incluye** (porque la Parte 1 no lo define): gastos personales pagados con dinero del emprendimiento.

✅ **DEFINIDO — Retiros/anticipos de dinero**: sí se necesita registrar cuánta plata ya retiró cada socio, para saber el saldo pendiente real en cualquier momento (no solo al cierre del mes). Se agrega una nueva entidad:

**RetiroSocio** (`id, socio, importe, fecha, concepto (opcional), observaciones, creado_por`)

Con esto, la Liquidación mensual pasa a mostrar un cuarto dato:

4. **Saldo pendiente por socio** = (Ganancia por mano de obra que le corresponde + Reembolsos que le corresponden) − Retiros ya realizados en el período. Así se puede consultar en cualquier momento cuánto le queda disponible a cada socio para retirar, no solo al cerrar el mes.

**Relación con otros módulos**: Trabajos (origen de ingresos y costos), Gastos (gastos generales del emprendimiento, que se restan del resultado neto del emprendimiento — Parte 1 §2 — pero no entran en el reembolso por `pagado_por`, que es específico de costos de trabajo), Socios (configuración 50/50 vigente).

---

## 10. Administración

✅ **DEFINIDO**: se formaliza con una tabla simple, para Fase 2/3 (no forma parte del MVP).

**TareaAdministrativa** (`id, titulo, descripcion, fecha, estado, responsable (usuario_id), observaciones`)

Permite registrar y hacer seguimiento de las tareas administrativas de Adrián (documentación, planillas, organización comercial) sin construir un sistema completo de gestión de proyectos. Al igual que el resto de los aportes de cada socio, esta tabla es puramente informativa/de seguimiento y **no genera ningún cálculo de porcentaje societario adicional** (Parte 1 §9, §23).

---

## 11. Marketing y Comercial

**Objetivo**: centralizar el origen comercial de los trabajos y, más adelante, medir el retorno de la inversión en publicidad (Parte 1 §1.2, §15, §16).

**Entidades** (Parte 1 §1.2): `LeadContacto`, `CanalContacto` (WhatsApp, Instagram, Facebook, Google, Referido, Publicidad, Otro), `CampañaMarketing` (`nombre, plataforma, inversion, fecha_inicio, fecha_fin, canal`).

**Flujo comercial**: Lead → contacto → presupuesto → aprobación → conversión a Cliente + creación efectiva de Trabajo (ver módulo 4). Estados comerciales del lead (Parte 1 §15): Nuevo contacto, Contactado, Presupuesto solicitado, Presupuesto enviado, Esperando respuesta, Aprobado, Trabajo realizado, Perdido.

**Funcionalidades del MVP**: registrar Lead con su canal de origen y convertirlo en Cliente. **No** se implementan todavía (Fase futura, Parte 1 §16): integraciones con Meta Ads/Google Ads, ni métricas automáticas de campaña → contactos → presupuestos → trabajos → ingresos (esas métricas requieren vincular `CampañaMarketing` con `LeadContacto`, lo cual está modelado pero no priorizado para el MVP).

**Regla de negocio**: igual que con la mano de obra, el trabajo de marketing/administrativo de Adrián se registra para análisis, pero **no** convierte automáticamente en porcentaje societario adicional (Parte 1 §9, §23).

---

## 12. Dashboard

**Objetivo** (Parte 1 §17): panel simple, visual y práctico, priorizando información que ayude a decidir — sin sobrecargar de indicadores.

**Indicadores del MVP** (todos ya definidos en Parte 1 §17):
- Ingresos del mes / Gastos del mes / Costos directos / Resultado.
- Trabajos realizados / Trabajos pendientes / Presupuestos pendientes.
- Dinero pendiente de cobro.
- Resultado estimado 50/50 (vía Liquidación mensual, módulo 9).
- Gastos fijos / Gastos variables.
- Inversión en publicidad *(dato disponible recién si se carga `CampañaMarketing` — puede mostrarse en $0 hasta que ese módulo esté activo)*.

**No incluidos en el MVP** por decisión ya tomada en Parte 1: tendencias mensuales avanzadas, indicadores de capacidad laboral (quedan para reportes, módulo 13).

---

## 13. Reportes

Los reportes explícitamente pedidos por la Parte 1 (§11, §17, §18) y ya soportados por el modelo de datos:

| Reporte | Dato operativo u financiero | Módulo fuente |
|---|---|---|
| Resultado mensual | Financiero | Trabajos + Gastos + Liquidación |
| Ingresos / Gastos por período | Financiero | Ingresos + Gastos |
| Rentabilidad por trabajo | Financiero | CostoTrabajo + Ingreso |
| Rentabilidad por tipo de servicio / equipo | Financiero | Trabajos agrupados |
| Trabajos por socio | Operativo | TrabajoParticipante |
| Trabajos conjuntos | Operativo | TrabajoParticipante |
| Presupuestos (estado, conversión) | Operativo/comercial | Trabajo (estado_comercial) |
| Cobros pendientes | Financiero | Ingreso (estado_pago) |
| Marketing (inversión → resultado) | Comercial | CampañaMarketing + LeadContacto *(Fase futura)* |
| Evolución mensual | Financiero | Series de Dashboard |

No se agregan reportes que la Parte 1 no pidió (por ejemplo, no hay reporte de "productividad por hora" porque las horas dedicadas son un campo opcional futuro, no del MVP — Parte 1 §4).

---

## 14. Futura venta de insumos

Solo se documentan requerimientos funcionales, sin desarrollarlos (Parte 1 §1.5, §13): `Producto`, `Stock`, `MovimientoStock`, `Compra`, `Venta`, `Proveedor` (ya existe desde Fase 1 para gastos). Se necesitarán campos de costo, precio de venta y margen — ninguno definido todavía porque no es parte del alcance actual. Queda para Fase 3 (ver roadmap, módulo 20).

---

## 15. Colaboradores y crecimiento

**Hoy (MVP)**: `ColaboradorExterno` — persona contratada puntualmente, no es `Usuario` del sistema, participa vía `TrabajoParticipante` con `rol_en_trabajo = colaborador_externo`, y su pago se registra como `CostoTrabajo` tipo `mano_obra_externa` (Parte 1 §1.3, §1.6 — ya definido).

**Futuro** (Parte 1 §1.5, §15): `Empleado` como evolución del modelo `Usuario`/`Rol`, y eventualmente equipos de trabajo. No se desarrolla un sistema de RRHH completo — solo se deja el modelo preparado para poder incorporarlo sin rediseñar lo existente.

---

## 16. Roles y Permisos

Ya definidos en Parte 1 §5:

| Rol | Alcance | Fase |
|---|---|---|
| Admin/Socio | Acceso completo | MVP |
| Técnico | Solo trabajos asignados, clientes vinculados, estado operativo | Futuro |
| Administrativo | Clientes, presupuestos, ingresos, gastos, marketing | Futuro |

El sistema de permisos (tabla `Rol` + guards) se implementa desde el MVP aunque hoy solo haya un rol activo, para no rediseñar autenticación más adelante.

---

## 17. Auditoría

Ya definido en Parte 1 §1.7, §22: `AuditLog` (`entidad, entidad_id, accion, usuario_id, fecha, valor_anterior, valor_nuevo`). Cubre creación, modificación y eliminación de: trabajos, importes, gastos, cambios de estado, registro de cobros, y el `%` de service del vehículo cuando se define caso por caso (Parte 1 §8, punto 6).

---

## 18. Automatizaciones futuras (preparación para n8n)

No se implementa nada de esto todavía. Eventos identificados en Parte 1 §7 y que el modelo de datos ya soporta sin cambios:

- Nuevo lead (Marketing → Leads).
- Presupuesto aprobado → cambio de `estado_comercial` a Aprobado (Trabajos).
- Trabajo finalizado → cambio de `estado_operativo` a Finalizado (Trabajos), potencial disparador de solicitud de reseña.
- Registro de pago → nuevo `Ingreso` con `estado = Cobrado`.
- Fin de mes → generación del reporte de Liquidación mensual (módulo 9) y envío de informe.

La arquitectura ya prevé (Parte 1 §7): API REST documentada, autenticación por API Key separada del login de socios, y un modelo de eventos derivable del `AuditLog` para que n8n pueda hacer *polling* al principio y evolucionar a webhooks salientes después.

---

## 19. Flujos de usuario

### Cliente nuevo

```
Lead (canal de origen)
   → Contactado
   → Presupuesto (Trabajo en estado_comercial = Presupuesto)
   → Presupuesto enviado
   → Aprobado → conversión Lead → Cliente
   → Programado → En ejecución → Finalizado
   → Cobro (estado_pago = Cobrado)
   → Historial del cliente (visible en su ficha)
```

### Trabajo

```
Creación (estado_comercial = Consulta)
   → Presupuesto → Presupuesto enviado → Aprobado
   → Asignación de participantes (Nahuel / Adrián / conjunto / colaborador externo)
   → Programado → En ejecución
   → Carga de costos (materiales, transporte, mano de obra externa) con pagado_por
   → Finalizado (se define precio_final)
   → Cobro (Ingreso, criterio percibido)
   → Cálculo de rentabilidad del trabajo (Ingreso − Costos directos)
```

### Liquidación mensual (flujo específico de CLIMARTE, derivado de Parte 1 §1.6)

```
Cierre de período
   → Sumar ganancia por mano de obra de todos los trabajos cobrados → repartir 50/50
   → Sumar costos directos del período agrupados por pagado_por → calcular reembolsos
   → Sumar retiros ya realizados por cada socio en el período (RetiroSocio)
   → Calcular saldo pendiente por socio = ganancia + reembolsos − retiros
```

---

## 20. MVP / Fase 2 / Fase 3

Se condensa el roadmap detallado de 7 fases de la Parte 1 (§9) en tres niveles, tal como pide esta especificación:

### MVP — primera versión

Justificación: es lo mínimo para operar CLIMARTE con el sistema nuevo desde septiembre, reemplazando la planilla actual, sin perder ninguna regla de rentabilidad ya definida.

- Autenticación (1 rol: Admin/Socio).
- Clientes (alta, edición, historial).
- Trabajos completos: estados separados (comercial/operativo/pago), participantes, costos con `pagado_por`, ingresos con criterio percibido.
- Presupuestos como estado del Trabajo (Opción A, módulo 4).
- Gastos fijos y variables con categorías.
- Transporte con escala de montos manual.
- Configuración de participación societaria 50/50 versionada.
- Liquidación mensual / cuenta corriente entre socios, incluyendo registro de retiros (`RetiroSocio`).
- Garantía de 3 meses por defecto en cada trabajo.
- Dashboard básico.
- Auditoría básica.
- Herramientas/equipos (registro simple).
- Vehículo: combustible + service con % configurable.

### Fase 2 — importante pero no indispensable para arrancar

Justificación: mejora la operación diaria y prepara el crecimiento del equipo, pero CLIMARTE puede operar sin esto desde el día uno.

- Leads básicos y su conversión a Cliente (canalización comercial simple).
- Roles Técnico y Administrativo con permisos reales.
- Reportes de rentabilidad por tipo de servicio/equipo/socio.
- Cálculo de transporte por kilómetros (mejora sobre la escala manual).

### Fase 3 — automatizaciones, integraciones y funcionalidades avanzadas

Justificación: son las funcionalidades que la Parte 1 explícitamente marcó como "no desarrollar todavía", condicionadas a que el negocio las necesite.

- Marketing y campañas con métricas de retorno.
- API pública documentada + eventos + primeras automatizaciones con n8n.
- Venta de insumos: productos, stock, compras, proveedores, ventas.
- RRHH básico (empleados, equipos de trabajo).
- Integraciones publicitarias avanzadas (Meta/Google Ads).

---

## Resumen de puntos ⚠️ PENDIENTES DE DEFINICIÓN en esta Parte 2

Los 8 puntos nuevos que había abierto esta Parte 2 ya quedaron **resueltos**:

1. ✅ Estados del trabajo — valores confirmados.
2. ✅ Garantía — 3 meses por defecto.
3. ✅ Presupuesto — Opción A (estado del Trabajo).
4. ✅ Comprobante de gasto — opcional.
5. ✅ Combustible sin trabajo asociado — gasto general del vehículo.
6. ✅ Caja — Opción A (reporte derivado, sin cuenta común).
7. ✅ Retiros/anticipos — se registran con `RetiroSocio`.
8. ✅ Módulo de Administración — se formaliza con `TareaAdministrativa` (Fase 2/3).

**Quedan abiertos únicamente los heredados de la Parte 1**, ninguno bloqueante para arrancar el MVP:
- % exacto de service del vehículo por evento (queda editable caso por caso, ya definido el mecanismo).
- Situación fiscal / facturación.
- Ajuste por inflación en comparativas históricas.
- Límite de aprobación de gastos entre socios.
- Margen sobre materiales cobrados al cliente.
- Trabajos cancelados con costos ya incurridos.
- Fecha exacta de corte de septiembre.

Con esto, la Parte 2 queda cerrada. El siguiente paso natural es la **Parte 3: diseño técnico** (schema de base de datos definitivo, contratos de API/DTOs, wireframes de pantallas principales), ya sobre el stack confirmado (NestJS + PostgreSQL + Prisma + React).
