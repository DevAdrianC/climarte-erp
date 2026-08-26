# ERP CLIMARTE — Análisis Funcional y Propuesta de Arquitectura (Fase 1)

> Documento de trabajo. No incluye código. Objetivo: validar modelo de negocio, entidades, arquitectura y roadmap antes de programar.

---

## 0. Resumen ejecutivo

El requerimiento es claro y bien pensado en un punto crítico: **separar participación societaria (50/50) de productividad individual y de aportes de recursos**. Esa separación es el eje que debe atravesar todo el modelo de datos, no solo un checkbox conceptual. El resto del documento respeta estrictamente esa regla y no inventa mecanismos económicos no especificados (todo lo no definido queda marcado como **PENDIENTE DE DEFINICIÓN**).

Se propone: backend en **Node.js + TypeScript (NestJS)**, base de datos **PostgreSQL** con **Prisma ORM**, API **REST** documentada (OpenAPI) pensada desde el día uno para consumo por n8n, frontend **React + TypeScript (Vite)**, autenticación **JWT**, despliegue simple con **Docker Compose**.

---

## 1. Entidades y relaciones

### 1.1 Núcleo societario y configuración

- **Usuario** (persona con acceso al sistema: Nahuel, Adrián, futuros técnicos/administrativos)
- **Rol** (Admin/Socio, Técnico, Administrativo — configurable)
- **ConfiguracionParticipacion** (registro versionado: `{socio, porcentaje, vigente_desde, vigente_hasta, creado_por}`) — permite que 50/50 cambie en el futuro sin perder historial ni tocar trabajos ya cerrados.

### 1.2 Comercial

- **Cliente** (`{nombre, telefono, whatsapp, direccion, localidad, observaciones}`)
- **LeadContacto** (cliente potencial, antes de convertirse en Cliente)
- **CanalContacto** (WhatsApp, Instagram, Facebook, Google, Referido, Publicidad, Otro)
- **CampañaMarketing** (`{nombre, plataforma, inversion, fecha_inicio, fecha_fin, canal}`)

### 1.3 Operativo

- **TipoServicio** (Instalación, Reparación, Limpieza, Diagnóstico, Mantenimiento — configurable)
- **TipoEquipo** (Aire acondicionado, Heladera, Freezer, Lavarropas, Otro — configurable)
- **EstadoTrabajo** (configurable, ver punto 6 sobre problema detectado)
- **Trabajo** (entidad central)
- **TrabajoParticipante** (tabla intermedia N:N entre Trabajo y Usuario/Colaborador externo, con `rol_en_trabajo`: responsable, participante, colaborador_externo)
- **ColaboradorExterno** (persona contratada puntualmente, no es Usuario del sistema)
- **CostoTrabajo** (`{trabajo_id, tipo: materiales|transporte|mano_obra_externa|otro, importe, descripcion, pagado_por (usuario_id, opcional)}`) — **la mano de obra de los socios NO es un tipo de costo** (ver 1.6), pero la **mano de obra de un colaborador externo sí lo es** (`mano_obra_externa`), igual que un material: se paga por día de trabajo contratado y se descuenta antes de calcular la ganancia repartible. `pagado_por` registra qué socio adelantó ese gasto de su propio bolsillo, para el reembolso en la liquidación mensual.
- **Ingreso/Pago** (`{trabajo_id, cliente_id, importe, medio_pago, fecha, estado, fecha_vencimiento (opcional)}`) — el campo `fecha_vencimiento` habilita a futuro avisos/recordatorios de cobro (ver 1.6 y sección 8.1 actualizada). El ingreso se registra en **criterio percibido**: se carga cuando el trabajo se cobra, no cuando se presupuesta (ver 1.6 y sección 8.4 actualizada).

### 1.4 Recursos y gastos

- **Herramienta/Equipo** (activo del emprendimiento; registro simple, sin depreciación por ahora)
- **Vehiculo** (la camioneta de Nahuel)
- **RegistroCombustible** (`{vehiculo_id, fecha, importe, trabajo_id opcional, pagado_por (usuario_id, opcional)}`)
- **RegistroService** (`{vehiculo_id, fecha, importe_total, porcentaje_atribuido (config. 30-50%), importe_atribuido}`)
- **CategoriaGasto** (configurable)
- **GastoFijo** (`{categoria, importe, periodicidad: mensual, fecha}`)
- **GastoVariable** (`{categoria, importe, fecha, proveedor_id opcional, trabajo_id opcional}` — el campo `trabajo_id` opcional es justamente lo que permite distinguir costo directo de gasto general)
- **Proveedor**

### 1.5 Futuro (preparado, no desarrollado en Fase 1)

- **Producto**, **Stock**, **MovimientoStock**, **Compra**, **Venta** (venta de insumos)
- **Empleado** (evolución de Usuario/Rol hacia RRHH)

### 1.6 Mano de obra, ganancia y reembolso de costos adelantados *(definido a partir de tus aclaraciones)*

Esto es un punto de diseño central, así que queda explícito:

- **La mano de obra de los socios no es un costo del trabajo.** Es directamente la ganancia que genera el trabajo, y se reparte **50/50 entre Nahuel y Adrián** como parte del resultado del emprendimiento — no se descuenta como si fuera un gasto. Por eso `CostoTrabajo` no incluye un tipo `mano_obra` para los socios: ese valor vive en el precio del trabajo (`Trabajo.precio_final` o un desglose `precio_mano_obra` dentro de él), no en la tabla de costos.
- **La mano de obra de un colaborador externo sí es un costo real** (tipo `mano_obra_externa`): se paga un monto fijo por día de trabajo contratado, igual que se paga un material para la instalación. Se descuenta antes de calcular la ganancia repartible del trabajo.
- **Materiales, transporte y mano de obra externa son costos directos reales.** Muchas veces uno de los dos socios los paga de su bolsillo al momento del trabajo ("por lo general es absorbido en un inicio por nosotros"). Para eso existe el campo `pagado_por` en `CostoTrabajo` y en `RegistroCombustible`: no cambia la ganancia ni la participación societaria, pero permite calcular cuánto hay que devolverle a cada socio en la liquidación mensual.
- **Transporte se carga por trabajo, con un monto elegido en el momento** (no automático todavía): al cargar el trabajo realizado se evalúa cuántos viajes hizo falta (uno o dos al domicilio, ida a buscar materiales al proveedor, etc.) y se asigna un monto de una escala simple — por ahora $5.000 / $10.000 / $15.000 — como costo de tipo `transporte` en `CostoTrabajo`. **Mejora futura marcada para más adelante** (no en el MVP): calcular el costo de transporte automáticamente por kilómetros recorridos en la jornada, usando el consumo promedio del vehículo y el precio del combustible del día. Cuando se implemente, `Vehiculo` sumará un campo `consumo_promedio_km_por_litro` y el cálculo se hará contra el precio de combustible vigente ese día.
- **Resultado (ganancia) del trabajo** = Ingreso del trabajo − Costos directos (materiales + transporte + mano de obra externa + otros). Esa ganancia se reparte 50/50.
- **Reembolso de costos adelantados** es un cálculo aparte, no una ganancia: es simplemente devolverle a cada socio la plata que puso de su bolsillo para materiales/transporte/mano de obra externa/otros, sumando por `pagado_por` en el período. No se reparte 50/50 — se devuelve entero a quien lo adelantó.
- **El ingreso se registra en criterio percibido: cuando se cobra el trabajo, no cuando se presupuesta.** El `precio_final` de un trabajo se define recién al finalizarlo, porque puede variar respecto al presupuesto original (trabajos agregados en el momento — ej. un capacitor roto, carga de gas inesperada). Por eso `Trabajo.precio_presupuestado` y `Trabajo.precio_final` son campos separados, y el `Ingreso` asociado se carga con la fecha real de cobro, que puede ser un día distinto al de finalización del trabajo.

**Ejemplo (con tus números):** instalación con mano de obra $150.000 (ganancia, se reparte 50/50 → $75.000 c/u), materiales $80.000 pagados por Nahuel, transporte $10.000 pagado por Nahuel. En la liquidación mensual: Nahuel recibe $75.000 de ganancia + $90.000 de reembolso por lo que adelantó; Adrián recibe $75.000 de ganancia. El reembolso de Nahuel no sale de la ganancia de Adrián — sale del efectivo total del emprendimiento antes de repartir lo que sobra.

**Nuevo módulo: Liquidación mensual / cuenta corriente entre socios.** Es un reporte (no requiere tablas nuevas más allá de `pagado_por`) que para un período muestra: (a) ganancia total por mano de obra propia y su reparto 50/50, (b) total de costos directos agrupados por quién los pagó, (c) saldo neto a transferir entre socios para que ambos terminen parejos. **Se incorpora al MVP (Fase 1)**, no queda para más adelante, porque es información que van a necesitar cada mes desde el arranque.

### 1.7 Transversal

- **AuditLog** (`{entidad, entidad_id, accion, usuario_id, fecha, valor_anterior, valor_nuevo}`) — cubre el punto 22 del requerimiento.

### Diagrama relacional (simplificado)

```
Cliente 1───N Trabajo N───N Usuario/Colaborador  (vía TrabajoParticipante)
Trabajo 1───N CostoTrabajo
Trabajo 1───N Ingreso/Pago
Trabajo N───1 TipoServicio / TipoEquipo / EstadoTrabajo
LeadContacto N───1 CanalContacto ──> (conversión) ──> Cliente
CampañaMarketing 1───N LeadContacto
GastoVariable N───1 CategoriaGasto, N───1 Proveedor, N───(0/1)───1 Trabajo
Vehiculo 1───N RegistroCombustible, 1───N RegistroService
Herramienta N───1 Usuario (responsable)
ConfiguracionParticipacion (histórica, no ligada a Trabajo)
AuditLog (referencia genérica a cualquier entidad)
```

**Punto de diseño clave**: `Trabajo` **no** tiene un campo `porcentaje_nahuel / porcentaje_adrian`. La distribución 50/50 se calcula siempre a nivel de resultado agregado del emprendimiento (mes, período), nunca por trabajo individual — tal como pide el punto 12 del requerimiento ("no modificar manualmente los porcentajes en cada trabajo"). La ganancia por mano de obra sí se reparte 50/50, pero los reembolsos por `pagado_por` son un cálculo aparte, no societario (ver 1.7).

**Punto de arranque del sistema**: el nuevo ERP arranca en **septiembre** con **cero trabajos pendientes de cobro**. Los cobros pendientes generados con el sistema anterior se gestionan fuera del ERP nuevo (sistema/planilla antigua). Desde septiembre en adelante, toda deuda pendiente de un cliente se carga en el ERP nuevo con su `fecha_vencimiento`, para poder mostrar avisos/recordatorios (manuales al inicio, automatizables con n8n más adelante).

---

## 2. Arquitectura técnica propuesta

### 2.1 Justificación del enfoque

Se propone una arquitectura de **monolito modular** (no microservicios) por estas razones:

- El equipo es de 2 personas sin necesidad operativa de escalar horizontalmente todavía.
- Un monolito modular bien separado en capas (dominio, aplicación, infraestructura, API) da la mantenibilidad y capacidad de extraer módulos a futuro, sin la complejidad operativa de microservicios (orquestación, redes, observabilidad distribuida) que hoy sería sobreingeniería.
- Facilita enormemente la integración con n8n: **una sola API**, una sola base de autenticación, eventos centralizados.

### 2.2 Stack tecnológico propuesto

| Capa | Elección | Motivo |
|---|---|---|
| Backend | Node.js + TypeScript + **NestJS** | Estructura modular por convención (módulos, providers, DTOs), tipado fuerte reduce errores contables, gran soporte, curva de adopción razonable, excelente para exponer REST/webhooks que luego consume n8n. |
| Base de datos | **PostgreSQL** | Transaccional, robusto para reportes agregados (rentabilidad, resultado 50/50), soporta bien evolución de esquema a futuro (stock, ventas). |
| ORM | **Prisma** | Migraciones versionadas claras, tipado end-to-end, buena documentación del modelo (importante porque el modelo de datos es el corazón de este sistema). |
| Autenticación | JWT + roles (RBAC simple) | Suficiente para 2 socios hoy, escala naturalmente a Técnico/Administrativo. |
| API | REST + **OpenAPI/Swagger** | n8n consume REST/webhooks de forma nativa y sencilla; documentación automática facilita integraciones futuras. |
| Frontend | **React + TypeScript (Vite)** | Ecosistema maduro, tipado compartido con backend, ideal para dashboards y formularios de trabajos. |
| Infraestructura | **Docker Compose** (API + DB + Web) | Simplicidad de despliegue, portabilidad, fácil de mover a un VPS. |
| Automatización futura | **n8n** (self-hosted, fuera del monolito) | Se conecta vía API REST + webhooks, sin acoplar el ERP a n8n. |

### 2.3 Estructura de carpetas propuesta (monorepo)

```
climarte-erp/
├── apps/
│   ├── api/                        # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── usuarios/
│   │   │   │   ├── clientes/
│   │   │   │   ├── leads/
│   │   │   │   ├── trabajos/
│   │   │   │   ├── costos/
│   │   │   │   ├── ingresos/
│   │   │   │   ├── gastos/          # fijos + variables + categorías
│   │   │   │   ├── herramientas/
│   │   │   │   ├── vehiculos/
│   │   │   │   ├── marketing/
│   │   │   │   ├── participacion/   # config societaria 50/50
│   │   │   │   ├── dashboard/
│   │   │   │   ├── auditoria/
│   │   │   │   └── webhooks/        # entrada/salida para n8n (Fase futura)
│   │   │   ├── common/              # guards, interceptors, decoradores
│   │   │   └── main.ts
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/                         # React frontend
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── features/            # espejando módulos del backend
│           └── api/                 # cliente HTTP tipado
├── packages/
│   └── shared/                      # tipos/DTOs compartidos frontend-backend
├── docker-compose.yml
└── docs/
    └── modelo-de-negocio.md         # este documento, versionado junto al código
```

---

## 3. Modelo de datos (entidades principales, campos clave)

*(Simplificado; el detalle completo de tipos/constraints se define en `schema.prisma` en la etapa de implementación.)*

**Trabajo**
`id, cliente_id, fecha, tipo_equipo_id, tipo_servicio_id, descripcion, estado_id, precio_presupuestado, precio_final, forma_pago, estado_pago, observaciones, creado_por, creado_en`

**TrabajoParticipante**
`id, trabajo_id, usuario_id (nullable), colaborador_externo_id (nullable), rol_en_trabajo, horas_dedicadas (nullable, futuro)`

**CostoTrabajo**
`id, trabajo_id, tipo (mano_obra|materiales|transporte|otro), importe, descripcion`

**Ingreso**
`id, trabajo_id, cliente_id, importe, medio_pago, fecha, estado`

**GastoFijo / GastoVariable**
`id, categoria_id, importe, fecha, trabajo_id (nullable), proveedor_id (nullable), medio_pago, observaciones`

**ConfiguracionParticipacion**
`id, socio, porcentaje, vigente_desde, vigente_hasta (nullable), creado_por`

Esta tabla es lo que permite que el "Resultado neto del emprendimiento" se reparta 50/50 **sin** que ningún trabajo individual almacene un porcentaje — el reparto se calcula al momento de generar el reporte, tomando la configuración vigente en ese período.

---

## 4. Módulos iniciales (Fase 1 / MVP)

1. Autenticación y usuarios (solo rol Admin/Socio)
2. Clientes y Leads (básico, sin canalización automática todavía)
3. Trabajos (CRUD completo + participantes + costos)
4. Ingresos y pagos
5. Gastos fijos y variables (con categorías configurables)
6. Configuración de participación societaria (50/50, versionada)
7. Dashboard básico (los indicadores del punto 17 del requerimiento)
8. Auditoría básica (quién creó/modificó qué)
9. Herramientas/equipos (registro simple, sin depreciación)
10. Vehículo: combustible + service con % configurable

Quedan **fuera del MVP** (preparados en el modelo pero no desarrollados): marketing/campañas con métricas de retorno, roles Técnico/Administrativo, canalización comercial multicanal automatizada, stock/productos/ventas, integración activa con n8n, RRHH.

---

## 5. Roles y permisos

| Rol | Alcance en Fase 1 |
|---|---|
| Admin/Socio | Acceso completo a todo el sistema (Nahuel y Adrián) |
| Técnico *(futuro)* | Solo trabajos asignados, clientes vinculados, cambio de estado operativo |
| Administrativo *(futuro)* | Clientes, presupuestos, ingresos, gastos, marketing |

La tabla `Rol` y el sistema de permisos (guards en NestJS) se implementan desde el MVP aunque hoy solo exista un rol activo, para no tener que rediseñar auth más adelante.

---

## 6. Rutas / API principales (borrador)

```
POST   /auth/login
GET    /usuarios
GET    /clientes                    POST /clientes
GET    /clientes/:id/trabajos       # historial de trabajos de un cliente
GET    /leads                       POST /leads
GET    /trabajos                    POST /trabajos
GET    /trabajos/:id
PATCH  /trabajos/:id/estado
POST   /trabajos/:id/participantes
POST   /trabajos/:id/costos
POST   /trabajos/:id/ingresos
GET    /gastos-fijos                POST /gastos-fijos
GET    /gastos-variables            POST /gastos-variables
GET    /categorias-gasto
GET    /herramientas                POST /herramientas
GET    /vehiculos/:id/combustible   POST /vehiculos/:id/combustible
GET    /vehiculos/:id/service       POST /vehiculos/:id/service
GET    /config/participacion        POST /config/participacion   # crea nueva versión
GET    /dashboard/resumen?periodo=YYYY-MM
GET    /dashboard/rentabilidad?agrupar_por=servicio|socio|equipo
GET    /auditoria
```

Fase futura (no implementar aún): `POST /webhooks/inbound/lead` (entrada desde n8n), `POST /webhooks/outbound-subscriptions` (n8n se suscribe a eventos como `trabajo.finalizado`, `trabajo.cobrado`).

---

## 7. Preparación para integración futura con n8n

No se implementa la integración ahora, pero la arquitectura la deja lista:

- **API REST documentada (OpenAPI)** desde el día uno: cualquier automatización futura consume los mismos endpoints que usa el frontend.
- **Autenticación por API Key** separada del login de usuarios, para que n8n no dependa de sesiones de socios.
- **Modelo de eventos**: se recomienda que, desde el MVP, las acciones clave (`trabajo.creado`, `trabajo.estado_cambiado`, `ingreso.registrado`) queden registradas en una tabla de eventos (o se puedan derivar del `AuditLog`). Esto permite en el futuro que n8n haga *polling* simple, y más adelante evolucionar a webhooks salientes sin cambiar el modelo de datos.
- Los flujos descriptos en el requerimiento (nuevo contacto → lead, presupuesto aprobado → trabajo, trabajo finalizado → pedir reseña, fin de mes → informe) mapean 1 a 1 con los módulos ya definidos (Leads, Trabajos, Dashboard), así que no requieren entidades nuevas cuando se implementen.

---

## 8. Problemas, contradicciones y puntos PENDIENTES DE DEFINICIÓN

Esto es lo más importante de revisar antes de aprobar la arquitectura.

1. ✅ **DEFINIDO — Mezcla de tres tipos de estado en "Estado del trabajo"**. Se separa en tres campos independientes — `estado_comercial`, `estado_operativo`, `estado_pago`. Además queda confirmado el criterio de arranque: **el ERP nuevo empieza en septiembre con 0 trabajos pendientes de cobro**. Las deudas del sistema anterior se manejan por fuera (planilla/sistema antiguo) y no se migran. A partir de septiembre, toda deuda nueva se carga en `Ingreso` con `estado_pago = pendiente` y `fecha_vencimiento`, para poder mostrar avisos de cobro por cliente (manuales al inicio; automatizables con n8n cuando se implemente esa fase). **Queda pendiente solo un detalle menor**: confirmar la fecha exacta de corte (¿1 de septiembre? ¿fecha específica?) para configurar el arranque del sistema.

2. ✅ **DEFINIDO — Registro de transporte por trabajo**. Se carga a nivel de trabajo, evaluando en el momento cuántos viajes hizo falta (domicilio, ida a buscar materiales), con un monto elegido de una escala simple ($5.000 / $10.000 / $15.000 por ahora). **Mejora marcada para más adelante** (no bloquea el MVP): cálculo automático por kilómetros recorridos según consumo promedio del vehículo y precio del combustible del día. Ver detalle en 1.6.

3. **Trabajos cancelados con costos ya incurridos**. El requerimiento no define si esos costos se contabilizan como pérdida del emprendimiento o se descartan. **PENDIENTE DE DEFINICIÓN**.

4. ✅ **DEFINIDO — Criterio percibido**. El ingreso cuenta cuando se cobra, no cuando se genera el trabajo. El `precio_final` se define recién al finalizar el trabajo (puede variar por trabajos agregados en el momento, ej. capacitor roto, carga de gas). Ver detalle en 1.6.

5. **Aportes no monetizables de Adrián (marketing, administración)**. El documento es explícito en que esto NO debe traducirse en más porcentaje societario, lo cual el sistema respeta. Pero si en algún momento quieren medir "costo de oportunidad" de esas horas, hoy no hay forma de cuantificarlas. No es una contradicción, es una funcionalidad futura ya anticipada en el punto 9 y 25 del requerimiento — se deja mencionado para que no se pierda de vista.

6. **% de service del vehículo (30–50%)**. El requerimiento pide que sea configurable pero no dice quién decide el valor exacto en cada caso ni si queda documentado el motivo. **PENDIENTE DE DEFINICIÓN**: se recomienda que quede como campo editable por evento (no un valor global fijo) y que el `AuditLog` registre quién lo definió, para evitar futuras discusiones entre socios.

7. **Facturación / situación fiscal**. No se menciona si CLIMARTE factura (monotributo, etc.) ni cómo se relaciona eso con "Precio final" e "Importe cobrado". Esto puede impactar el modelo de Ingreso más adelante (necesidad de campo `numero_comprobante`, IVA, etc.). **PENDIENTE DE DEFINICIÓN** — no bloquea el MVP, pero conviene saberlo antes de cerrar el modelo de `Ingreso`.

8. **Moneda y actualización de precios**. Se asume pesos argentinos (ARS) sin ajuste por inflación en reportes históricos comparativos. Si en el futuro quieren comparar "rentabilidad de enero vs julio" de forma realista, un gasto fijo de $500.000 hoy no es comparable en términos reales a uno de dentro de un año. No es urgente para el MVP, pero **PENDIENTE DE DEFINICIÓN** si quieren que el dashboard contemple esto desde ya (aunque sea guardando el valor en un índice de referencia).

9. **Límite de aprobación de gastos**. No hay mención de si un socio puede cargar cualquier gasto sin aprobación del otro. Dado que ambos tienen acceso total como "Admin/Socio", hoy cualquiera puede registrar cualquier gasto. El `AuditLog` da trazabilidad pero no control preventivo. **PENDIENTE DE DEFINICIÓN** (probablemente no es necesario un flujo de aprobación en esta etapa, pero se señala).

10. ✅ **DEFINIDO — Mano de obra de los socios**. La mano de obra **no es un costo**: es la ganancia del trabajo y se reparte 50/50 entre Nahuel y Adrián, sin importar quién lo ejecutó (eso es productividad individual, no cambia la participación societaria). Materiales, transporte/combustible y otros costos sí son costos reales del trabajo, y quien los adelanta de su bolsillo (`pagado_por`) es reembolsado en la liquidación mensual, aparte del reparto 50/50 de la ganancia. Ver el modelo completo en la sección 1.7. **Nuevo pendiente derivado de esto** → punto 11 más abajo.

11. ✅ **DEFINIDO — Mano de obra de un colaborador externo**. Sí, es costo real: se paga un monto fijo por día de trabajo contratado, igual que un material. Se agrega el tipo `mano_obra_externa` en `CostoTrabajo`, distinto de la mano de obra de los socios (que no es costo). Ver 1.6.

12. **¿Los materiales se cobran al cliente con margen o al costo?** El ejemplo que diste no aclara si los $80.000 de materiales incluyen una ganancia extra para CLIMARTE o son un traspaso a costo. Esto no cambia el mecanismo de reembolso (que ya queda resuelto), pero sí cambia si "materiales" también aporta algo al resultado repartible 50/50, más allá de la mano de obra. **PENDIENTE DE DEFINICIÓN** (se puede dejar así — al costo — para el MVP, y ajustar el campo `margen_materiales` más adelante si deciden cobrar con margen).

Ninguno de estos puntos bloquea el diseño de la arquitectura general — todos son resolubles con configuración o campos opcionales que ya están contemplados en el modelo. Pero conviene decidirlos antes de programar el módulo de Trabajos y Gastos, porque son los que más se usan día a día.

---

## 9. Roadmap de desarrollo por fases

**Fase 0 (actual)**: este documento. Validación de arquitectura y resolución de puntos pendientes.

**Fase 1 — MVP**
Auth simple (1 rol), Clientes, Trabajos (CRUD + participantes + costos + estados separados), Ingresos/Pagos con avisos de vencimiento, Gastos fijos y variables con categorías y `pagado_por`, Configuración de participación 50/50 versionada, **Liquidación mensual / cuenta corriente entre socios**, Dashboard básico, Auditoría básica.

**Fase 2**
Herramientas/equipos (registro simple), Vehículo (combustible + service con % configurable), Leads básicos y su conversión a Cliente.

**Fase 3**
Roles Técnico y Administrativo con permisos reales, Canalización comercial multicanal (fuente de contacto, estados comerciales), reportes de rentabilidad por tipo de servicio / equipo / socio.

**Fase 4**
Marketing y campañas con métricas de retorno (inversión → contactos → presupuestos → trabajos → ingresos).

**Fase 5**
API pública documentada + capa de eventos, primeras automatizaciones reales con n8n (empezando por lo más simple: nuevo lead → notificación).

**Fase 6**
Módulo de insumos: Productos, Stock, Compras, Proveedores, Ventas.

**Fase 7**
RRHH básico (Empleados, equipos de trabajo), integraciones publicitarias avanzadas (Meta/Google Ads).

---

## 10. Próximo paso

Este documento no incluye desarrollo de código, tal como se pidió. De los 12 puntos de la sección 8, ya quedaron **definidos los cinco que afectaban directamente el cálculo de rentabilidad y la carga diaria de un trabajo**: estados/arranque en septiembre (#1), transporte (#2), devengado/percibido (#4), mano de obra de los socios (#10) y mano de obra externa (#11).

Lo que queda pendiente son puntos menores que **no bloquean el arranque del MVP** y se pueden decidir sobre la marcha o dejar con el criterio por defecto que ya propuse:

- Fecha exacta de corte en septiembre.
- Trabajos cancelados con costos ya incurridos (#3).
- % de service del vehículo (#6).
- Situación fiscal / facturación (#7).
- Ajuste por inflación en comparativas históricas (#8).
- Límite de aprobación de gastos entre socios (#9).
- Margen sobre materiales cobrados al cliente (#12).

También falta:

1. Confirmar el stack propuesto (sección 2.2) o señalar preferencias distintas.

Con eso, el modelo de negocio y la arquitectura quedan cerrados y la Fase 1 (MVP) puede iniciarse directamente sobre esta estructura de carpetas y modelo de datos.
