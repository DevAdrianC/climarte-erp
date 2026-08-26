# 03 — CLIMARTE ERP — Arquitectura Técnica

**Fuentes exclusivas y obligatorias**: *01 - Análisis y Arquitectura* (Parte 1) y *02 - Especificación Funcional* (Parte 2), ya validadas. Este documento no modifica ninguna decisión de negocio tomada allí; traduce lo ya aprobado a decisiones técnicas concretas. Todo lo que falta definir técnicamente queda marcado como ⚠️ **PENDIENTE DE DEFINICIÓN**, y toda decisión de negocio que siga abierta se lista en la sección 23 sin resolverla.

---

## 1. Resumen

CLIMARTE ERP se construye como un **monolito modular** en **NestJS + PostgreSQL + Prisma**, con frontend en **React**, pensado para un equipo de 2 socios hoy y preparado para crecer (técnicos, stock, marketing avanzado, automatización con n8n) sin rediseñar lo ya construido. La prioridad técnica, igual que la de negocio, es **simplicidad antes que sofisticación**: nada de microservicios, nada de sistema contable complejo, nada de infraestructura que el tamaño actual del negocio no justifique.

## 2. Objetivos técnicos

Directamente heredados de la Parte 1 §20/§25 y del pedido de esta Parte 3: simplicidad, mantenibilidad, seguridad, escalabilidad progresiva, bajo costo inicial, facilidad de integración externa (n8n, y a futuro WhatsApp/email), y ninguna sobreingeniería para el tamaño actual de CLIMARTE.

## Nota — Puntos de atención detectados entre Parte 1 y Parte 2

No se encontraron contradicciones de negocio entre ambos documentos. Sí hay dos puntos que conviene aclarar para que no se confundan durante la implementación (no son contradicciones, son dos conceptos con nombres parecidos que corresponden a entidades distintas):

- **`LeadContacto.estado_comercial`** (Nuevo contacto, Contactado, Presupuesto solicitado, Presupuesto enviado, Esperando respuesta, Aprobado, Trabajo realizado, Perdido — Parte 1 §15) es una máquina de estados **distinta** de **`Trabajo.estado_comercial`** (Consulta, Presupuesto, Presupuesto enviado, Aprobado, Rechazado — Parte 2 §3.2), aunque comparten varios nombres. Son dos entidades diferentes con ciclos de vida propios; el Lead se cierra ("Trabajo realizado" o "Perdido") cuando el Trabajo asociado avanza, pero no son el mismo campo.
- **Trabajo cancelado tras la aprobación**: `estado_operativo = Cancelado` existe, pero qué pasa contablemente con los costos ya cargados en ese trabajo sigue siendo la Parte 1 §8 punto 3, todavía ⚠️ pendiente (ver sección 23). Técnicamente el modelo ya soporta cualquier resolución que se decida (los costos quedan igual en `CostoTrabajo`, asociados al trabajo, se cuenten o no en un reporte de pérdidas).

---

## 3. Stack tecnológico recomendado

| Capa | Recomendación | Alternativas evaluadas | Por qué se descartan |
|---|---|---|---|
| Backend | **Node.js + TypeScript + NestJS** | Python (Django/FastAPI) | El equipo no mencionó experiencia previa en Python; Node/TS comparte lenguaje con el frontend, reduciendo la curva de aprendizaje total del proyecto. FastAPI es válido pero NestJS da estructura modular por convención, que es justamente lo que este ERP necesita para no volverse un monolito desordenado. |
| Base de datos | **PostgreSQL** | Supabase (Postgres + backend-as-a-service), MySQL | Supabase es Postgres por debajo — se puede usar como *hosting* de la base sin cambiar la recomendación (ver §16). MySQL no aporta ninguna ventaja sobre Postgres para este caso y Postgres maneja mejor consultas agregadas (rentabilidad, liquidación mensual). |
| ORM | **Prisma** | TypeORM, Drizzle | Prisma da el mejor balance de tipado end-to-end, migraciones legibles y documentación del modelo — importante porque el modelo de datos es el corazón de este sistema (Parte 1 §20). |
| Autenticación | **JWT (access + refresh token) + bcrypt/argon2 para contraseñas** | Sesiones con cookies + Redis | JWT sin estado es más simple de operar sin infraestructura adicional (no requiere Redis) y es compatible con futuros clientes (app técnicos, n8n vía API Key separada). |
| API | **REST + OpenAPI/Swagger** (`@nestjs/swagger`) | GraphQL | REST es más simple de consumir por n8n de forma nativa (Parte 1 §7, §19) y no aporta complejidad extra de esquema como GraphQL. |
| Validación | **class-validator + class-transformer** (DTOs de NestJS) | Zod | Es el estándar de NestJS, se integra directo con Swagger y con los DTOs sin capas extra. |
| Formularios (frontend) | **React Hook Form** | Formik | Menor re-render, mejor performance en formularios largos como el de Trabajo (muchos campos). |
| Estado global (frontend) | **React Query (TanStack Query)** para estado de servidor; **Context/Zustand** solo si hace falta estado de UI global | Redux | El ERP es mayormente CRUD contra la API — React Query cubre cache, refetch y sincronización sin la complejidad de Redux. Zustand queda como opción liviana si aparece estado de UI complejo (ej. wizard de carga de trabajo). |
| UI / componentes | **Tailwind CSS + shadcn/ui** | Material UI, Ant Design | Tailwind + shadcn da control total del diseño sin el peso de una librería de componentes completa, y es fácil de mantener por un equipo chico. |
| Testing | **Jest + Supertest** (backend), **Vitest + React Testing Library** (frontend) | — | Estándar del ecosistema NestJS/Vite, sin fricción de configuración. |
| Deploy | **Docker Compose** para desarrollo local; contenedor único de API + Web para producción | — | Ver §16 para el detalle de hosting. |
| Hosting | Ver §16 | — | — |
| Storage (archivos) | No implementado en el MVP (ver §23) — `comprobante_url` queda como campo opcional sin uso activo | Cloudflare R2, AWS S3 | A evaluar recién cuando haga falta adjuntar comprobantes en la práctica. |
| Logs | **Pino** (backend), archivo rotado o salida a stdout capturada por el proveedor de hosting | Winston | Pino es más liviano y rápido; suficiente para el volumen de esta aplicación. |
| Backups | Ver §15 | — | — |

---

## 4. Arquitectura general

```
Usuario (Nahuel / Adrián / futuro Técnico)
        │
        ▼
   Frontend (React + Vite)
        │  HTTPS / REST + JWT
        ▼
   Backend API (NestJS)
        │
        ├── Módulos de dominio (Trabajos, Gastos, Socios, Liquidación, ...)
        ├── Capa de autenticación y permisos (Guards)
        ├── Capa de auditoría (interceptor transversal)
        │
        ▼
   PostgreSQL (vía Prisma)
```

**Preparación para integraciones externas (no implementada aún, Parte 1 §7, §19):**

```
Backend API (NestJS)
   ↔  n8n              (REST + API Key, eventos vía AuditLog/polling → webhooks salientes a futuro)
   ↔  WhatsApp/Email    (a través de n8n, no integración directa desde el ERP)
   ↔  Meta/Google Ads   (Fase 3, a través de n8n o integración directa a evaluar en su momento)
```

El ERP nunca se integra directamente con WhatsApp, email o plataformas publicitarias — todo eso pasa por n8n, manteniendo al ERP como la única fuente de verdad de los datos y a n8n como la capa de automatización (consistente con Parte 1 §19).

---

## 5. Estructura del proyecto

Monorepo simple (sin herramientas de monorepo como Nx/Turborepo por ahora — ver §23), con `npm workspaces`:

```
climarte-erp/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # login, JWT, guards
│   │   │   │   ├── usuarios/         # Usuario, Rol
│   │   │   │   ├── clientes/
│   │   │   │   ├── leads/            # LeadContacto, CanalContacto
│   │   │   │   ├── trabajos/         # Trabajo, TrabajoParticipante, CostoTrabajo, ColaboradorExterno
│   │   │   │   ├── ingresos/         # Ingreso (pagos/cobros)
│   │   │   │   ├── gastos/           # GastoFijo, GastoVariable, CategoriaGasto, Proveedor
│   │   │   │   ├── vehiculos/        # Vehiculo, RegistroCombustible, RegistroService
│   │   │   │   ├── herramientas/     # Herramienta/Equipo
│   │   │   │   ├── socios/           # ConfiguracionParticipacion
│   │   │   │   ├── liquidacion/      # cálculo de Liquidación mensual, RetiroSocio
│   │   │   │   ├── administracion/   # TareaAdministrativa (Fase 2)
│   │   │   │   ├── marketing/        # CampañaMarketing (Fase 3)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── reportes/
│   │   │   │   ├── auditoria/        # AuditLog + interceptor
│   │   │   │   └── webhooks/         # entrada/salida n8n (Fase 3, no MVP)
│   │   │   ├── common/               # guards, interceptors, decoradores, pipes
│   │   │   └── main.ts
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── web/                          # React frontend
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── features/             # espejando módulos del backend
│           └── api/                  # cliente HTTP tipado (React Query hooks)
├── packages/
│   └── shared/                       # tipos/DTOs compartidos frontend-backend
├── docker-compose.yml                # desarrollo local: api + db + web
├── .github/workflows/                # CI (lint, test, build)
└── docs/                             # 01, 02, 03, 04... versionados junto al código
```

Cada carpeta bajo `modules/` corresponde 1 a 1 con un módulo funcional de la Parte 2, para que cualquiera de los dos socios (o un desarrollador nuevo) pueda ubicar el código de una funcionalidad sin ambigüedad.

---

## 6. Modelo de datos

*(Nombres de tabla en español para mantener consistencia con las Partes 1 y 2; los tipos exactos de Prisma se definen al escribir el `schema.prisma`.)*

### Núcleo societario y usuarios

**Usuario** — `id, nombre, email, password_hash, rol_id, activo, creado_en`
**Rol** — `id, nombre (Admin/Socio, Técnico, Administrativo), permisos (json o tabla de permisos)`
**ConfiguracionParticipacion** — `id, socio (fk Usuario), porcentaje, vigente_desde, vigente_hasta (nullable), creado_por`. Restricción de negocio (a validar en capa de aplicación, no solo en DB): la suma de porcentajes vigentes en un mismo período debe ser 100.

### Comercial

**Cliente** — `id, nombre, telefono, whatsapp, direccion, localidad, observaciones, creado_en`
**LeadContacto** — `id, nombre, telefono, canal_id (fk CanalContacto), servicio_solicitado, estado_comercial, fecha, cliente_id (nullable, se completa al convertir), observaciones`
**CanalContacto** — `id, nombre` (configurable)
**CampañaMarketing** *(Fase 3)* — `id, nombre, plataforma, inversion, fecha_inicio, fecha_fin, canal_id`

### Operativo

**TipoServicio** / **TipoEquipo** — `id, nombre` (configurables)
**Trabajo** — `id, cliente_id, fecha, tipo_equipo_id, tipo_servicio_id, descripcion, estado_comercial, estado_operativo, estado_pago, precio_presupuestado, precio_final (nullable hasta finalizar), forma_pago, garantia_dias (default 90), garantia_observaciones, observaciones, creado_por, creado_en`
**TrabajoParticipante** — `id, trabajo_id, usuario_id (nullable), colaborador_externo_id (nullable), rol_en_trabajo (responsable | participante | colaborador_externo), horas_dedicadas (nullable, futuro)`. Constraint: exactamente uno de `usuario_id` / `colaborador_externo_id` debe estar presente.
**ColaboradorExterno** — `id, nombre, telefono (opcional), observaciones`
**CostoTrabajo** — `id, trabajo_id, tipo (materiales | transporte | mano_obra_externa | otro), importe, descripcion, pagado_por (nullable, fk Usuario), comprobante_url (nullable), creado_en`
**Ingreso** — `id, trabajo_id, cliente_id, importe, medio_pago, fecha, estado_pago, fecha_vencimiento (nullable), creado_en`

### Recursos y gastos

**Herramienta** — `id, nombre, estado, responsable_id (fk Usuario), fecha_incorporacion, observaciones`
**Vehiculo** — `id, nombre/patente, propietario_id (fk Usuario)`
**RegistroCombustible** — `id, vehiculo_id, fecha, importe, trabajo_id (nullable), pagado_por (nullable)`
**RegistroService** — `id, vehiculo_id, fecha, importe_total, porcentaje_atribuido, importe_atribuido (calculado), definido_por (fk Usuario)`
**CategoriaGasto** — `id, nombre` (configurable)
**Proveedor** — `id, nombre, contacto (opcional)`
**GastoFijo** — `id, categoria_id, importe, periodicidad, fecha, creado_por`
**GastoVariable** — `id, categoria_id, importe, fecha, proveedor_id (nullable), trabajo_id (nullable), medio_pago, pagado_por (nullable), comprobante_url (nullable), creado_por`

### Distribución de resultados

**RetiroSocio** — `id, socio_id (fk Usuario), importe, fecha, concepto (nullable), observaciones, creado_por`

### Administración *(Fase 2)*

**TareaAdministrativa** — `id, titulo, descripcion, fecha, estado, responsable_id (fk Usuario), observaciones`

### Transversal

**AuditLog** — `id, entidad, entidad_id, accion, usuario_id, fecha, valor_anterior (json), valor_nuevo (json)`

### Futuro (Fase 3, modelado pero no implementado — Parte 1 §1.5, Parte 2 §14)

**Producto**, **Stock**, **MovimientoStock**, **Compra**, **Venta**, **Empleado**.

---

## 7. Relaciones

```
Usuario N───1 Rol
ConfiguracionParticipacion N───1 Usuario (socio)

Cliente 1───N Trabajo
Cliente 1───N LeadContacto (histórico, si el lead ya se convirtió)
LeadContacto N───1 CanalContacto
CampañaMarketing 1───N LeadContacto

Trabajo N───1 Cliente, TipoServicio, TipoEquipo
Trabajo 1───N TrabajoParticipante
Trabajo 1───N CostoTrabajo
Trabajo 1───N Ingreso
TrabajoParticipante N───1 Usuario  ó  N───1 ColaboradorExterno (mutuamente excluyente)
CostoTrabajo N───1 Usuario (pagado_por, opcional)

Vehiculo 1───N RegistroCombustible
Vehiculo 1───N RegistroService
RegistroCombustible N───(0/1)───1 Trabajo

GastoFijo N───1 CategoriaGasto
GastoVariable N───1 CategoriaGasto, N───(0/1)───1 Proveedor, N───(0/1)───1 Trabajo

RetiroSocio N───1 Usuario (socio)

AuditLog → referencia genérica (entidad + entidad_id) a cualquier tabla
```

**Atención especial (Parte 1 §6, §23; Parte 2 §3.4, §8):**
- No existe **ninguna** relación entre `TrabajoParticipante` y `ConfiguracionParticipacion`. Son conceptos completamente independientes en el modelo — participar de un trabajo no toca la tabla de participación societaria.
- `Trabajo` no tiene columna de porcentaje. El 50/50 se calcula siempre en la capa de Liquidación mensual (módulo `liquidacion`), nunca almacenado por trabajo.
- Los trabajos conjuntos (Nahuel + Adrián) generan **dos filas** en `TrabajoParticipante` para el mismo `trabajo_id`; los individuales, una sola.

---

## 8. Reglas de negocio → reglas técnicas

Traducción directa de las Partes 1 y 2 a validaciones e invariantes que debe implementar el backend:

| Regla de negocio | Regla técnica |
|---|---|
| Participación societaria 50/50, versionable | Suma de `ConfiguracionParticipacion.porcentaje` vigentes en cualquier fecha debe ser 100 (validación de aplicación al crear/editar). |
| Mano de obra de los socios no es costo | `CostoTrabajo.tipo` no admite un valor `mano_obra` para socios — el enum solo permite `materiales | transporte | mano_obra_externa | otro`. |
| Mano de obra externa sí es costo | `mano_obra_externa` sí resta de la ganancia repartible al calcular rentabilidad del trabajo. |
| Reembolsos ≠ reparto de ganancia | El cálculo de Liquidación mensual debe tener dos sub-cálculos independientes: reparto 50/50 (sobre ganancia) y reembolso 1:1 (sobre `pagado_por`) — nunca mezclarlos en una sola fórmula. |
| Participación de un trabajo no altera el 50/50 | No debe existir ningún endpoint ni trigger que escriba en `ConfiguracionParticipacion` a partir de datos de `TrabajoParticipante`. Se valida con tests (ver §18). |
| Ingreso en criterio percibido | `Ingreso.fecha` es la fecha real de cobro, distinta de `Trabajo.fecha` o de la fecha de finalización; los reportes de resultado usan `Ingreso.fecha`, no la fecha del trabajo. |
| `precio_final` se define al finalizar | Validación de aplicación: no se permite `estado_operativo = Finalizado` sin `precio_final` cargado. |
| Garantía por defecto 3 meses | `garantia_dias` con default `90` a nivel de aplicación (y opcionalmente a nivel de esquema). |
| Costo directo vs. gasto general | Se distingue únicamente por la presencia o ausencia de `trabajo_id` en `GastoVariable` — no hay un campo booleano redundante. |
| Auditoría de cambios sensibles | Interceptor global de NestJS que escribe en `AuditLog` en cada mutación de: `Trabajo`, `CostoTrabajo`, `Ingreso`, `GastoFijo/Variable`, `RegistroService` (por el % configurable), `ConfiguracionParticipacion`, `RetiroSocio`. |

---

## 9. Autenticación

- **JWT** de acceso (vida corta, ~15-30 min) + **refresh token** (vida más larga, ~7-30 días), emitidos en `POST /api/auth/login`.
- Contraseñas con **bcrypt** (o argon2), nunca en texto plano ni siquiera en logs.
- El refresh token se puede revocar (tabla simple de tokens activos o lista de invalidación) para permitir "cerrar sesión en todos los dispositivos" si hiciera falta más adelante.
- Rate limiting específico en `/auth/login` (ej. `@nestjs/throttler`) para mitigar fuerza bruta.
- Autenticación separada para n8n: **API Key** de servicio, no JWT de usuario (Parte 1 §7) — se implementa recién en Fase 3, pero el modelo de permisos ya lo contempla como un "actor" distinto de un `Usuario`.

---

## 10. Roles y permisos

| Rol | Alcance (Parte 2 §16) | Implementación técnica |
|---|---|---|
| Admin/Socio | Acceso completo | Guard que permite todo; único rol activo en el MVP. |
| Técnico *(futuro)* | Solo trabajos asignados, clientes vinculados, estado operativo | Guard + filtro por `TrabajoParticipante.usuario_id = usuario_actual` en las queries de Trabajos. |
| Administrativo *(futuro)* | Clientes, presupuestos, ingresos, gastos, marketing | Guard por módulo (whitelist de rutas permitidas por rol). |

Implementación con **Guards + decoradores** de NestJS (`@Roles('admin')`) desde el día uno, aunque solo exista el rol Admin/Socio activo — evita rediseñar autenticación cuando se sumen Técnico/Administrativo en Fase 2.

---

## 11. API (rutas principales, borrador)

*(No se implementan todas todavía — es el diseño de referencia para ir construyendo por etapas.)*

| Método | Ruta | Propósito | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login, devuelve JWT + refresh | Pública |
| POST | `/api/auth/refresh` | Renovar access token | Refresh token |
| GET/POST | `/api/clientes` | Listar / crear clientes | Admin/Socio |
| GET | `/api/clientes/:id/trabajos` | Historial de trabajos de un cliente | Admin/Socio |
| GET/POST | `/api/leads` | Listar / crear leads | Admin/Socio *(Fase 2)* |
| POST | `/api/leads/:id/convertir` | Convertir lead en cliente | Admin/Socio *(Fase 2)* |
| GET/POST | `/api/trabajos` | Listar / crear trabajos | Admin/Socio, Técnico (filtrado) |
| GET | `/api/trabajos/:id` | Detalle de trabajo | Admin/Socio, Técnico (si participa) |
| PATCH | `/api/trabajos/:id/estado-comercial` | Cambiar estado comercial | Admin/Socio |
| PATCH | `/api/trabajos/:id/estado-operativo` | Cambiar estado operativo | Admin/Socio, Técnico |
| PATCH | `/api/trabajos/:id/finalizar` | Finalizar trabajo (exige `precio_final`) | Admin/Socio, Técnico |
| POST | `/api/trabajos/:id/participantes` | Agregar participante/colaborador | Admin/Socio |
| POST | `/api/trabajos/:id/costos` | Cargar costo (con `pagado_por`) | Admin/Socio |
| POST | `/api/trabajos/:id/ingresos` | Registrar cobro | Admin/Socio |
| GET/POST | `/api/gastos-fijos` | Gastos fijos | Admin/Socio |
| GET/POST | `/api/gastos-variables` | Gastos variables | Admin/Socio |
| GET | `/api/categorias-gasto` | Categorías configurables | Admin/Socio |
| GET/POST | `/api/herramientas` | Herramientas/equipos | Admin/Socio |
| GET/POST | `/api/vehiculos/:id/combustible` | Registro de combustible | Admin/Socio |
| GET/POST | `/api/vehiculos/:id/service` | Registro de service | Admin/Socio |
| GET/POST | `/api/config-participacion` | Configuración societaria (versionada) | Admin/Socio |
| GET | `/api/liquidacion?periodo=YYYY-MM` | Liquidación mensual (ganancia, reembolsos, retiros, saldo) | Admin/Socio |
| POST | `/api/retiros` | Registrar retiro de un socio | Admin/Socio |
| GET | `/api/dashboard/resumen?periodo=YYYY-MM` | Indicadores del dashboard | Admin/Socio |
| GET | `/api/reportes/rentabilidad?agrupar_por=servicio\|socio\|equipo` | Reportes de rentabilidad | Admin/Socio |
| GET | `/api/auditoria` | Consulta de auditoría | Admin/Socio |
| POST | `/api/tareas-administrativas` | Tareas de Adrián *(Fase 2)* | Admin/Socio |

Fase 3 (no MVP): `POST /api/webhooks/inbound/lead` (entrada desde n8n), suscripción de eventos salientes para n8n.

---

## 12. Eventos del sistema

Eventos internos que el ERP debe poder emitir (derivados de `AuditLog` o de una tabla de eventos liviana), listados en Parte 1 §7 y Parte 2 §18, más los que agrega esta Parte 3:

- `cliente.creado`
- `lead.creado`
- `lead.convertido`
- `trabajo.creado`
- `trabajo.estado_comercial_cambiado` (incluye aprobación de presupuesto)
- `trabajo.estado_operativo_cambiado` (incluye finalización)
- `trabajo.finalizado`
- `pago.registrado`
- `gasto.registrado`
- `liquidacion.generada` (cierre de período)
- `retiro.registrado`

**Diseño recomendado**: en el MVP, estos eventos se derivan directamente del `AuditLog` (no hace falta una tabla de eventos separada todavía). Cuando se implemente la integración con n8n (Fase 3), se evalúa si conviene una tabla de eventos dedicada con estado de "consumido" para soportar *polling* eficiente, o pasar directo a webhooks salientes.

---

## 13. Integración futura con n8n

No se implementa en esta etapa. La arquitectura queda preparada así:

- **API REST documentada con OpenAPI** desde el MVP — n8n consume los mismos endpoints que el frontend.
- **Autenticación por API Key**, separada del JWT de usuarios (§9), con permisos acotados (de solo lectura donde sea posible, y a los endpoints estrictamente necesarios para cada automatización).
- **Eventos** (§12) como base para dos modos de consumo: *polling* simple al principio (n8n consulta periódicamente `/api/auditoria` o un endpoint de eventos filtrado por fecha), evolucionando a **webhooks salientes** (`POST /api/webhooks/outbound-subscriptions`) cuando el volumen lo justifique.
- Los flujos ya identificados en Parte 1 §19 y Parte 2 §18 (nuevo lead, presupuesto aprobado, trabajo finalizado → reseña, pago registrado, informe de fin de mes) mapean 1 a 1 con los eventos de §12, sin requerir cambios de modelo cuando se implementen.

---

## 14. Seguridad

- **Transporte**: HTTPS obligatorio en todos los ambientes salvo desarrollo local.
- **Autenticación/autorización**: JWT + Guards por rol (§9, §10); ningún endpoint de datos financieros o de trabajos queda sin guard.
- **Validación de entrada**: DTOs con `class-validator` en cada endpoint — rechazo de payloads malformados antes de llegar a la capa de negocio.
- **Contraseñas**: hash con bcrypt/argon2, nunca reversible, nunca logueadas.
- **Cabeceras de seguridad**: `helmet` en NestJS (CSP básica, HSTS, etc.).
- **CORS**: restringido al dominio del frontend, no abierto (`*`).
- **Protección contra inyección SQL**: mitigada por diseño al usar Prisma (queries parametrizadas).
- **Datos financieros**: solo accesibles para roles Admin/Socio (y Administrativo cuando exista); ningún rol Técnico ve montos de ingresos/gastos/liquidación.
- **Logs**: nunca incluyen contraseñas, tokens completos, ni datos de tarjetas/medios de pago sensibles si en el futuro se integran pasarelas.
- **Rate limiting**: en login y en endpoints públicos si los hubiera (hoy no hay ninguno realmente público).
- **Secretos**: variables de entorno (`.env`), nunca commiteadas al repositorio (`.gitignore` desde el primer commit).

---

## 15. Backups

Estrategia simple y de bajo costo, adecuada al tamaño actual:

- **Backup automático diario** de PostgreSQL vía `pg_dump` (o el backup gestionado del proveedor de hosting elegido, ver §16).
- **Retención**: 30 días de backups diarios + 1 backup semanal conservado por 6 meses (protección extra ante errores detectados tarde).
- **Almacenamiento**: fuera del mismo servidor de la base (bucket S3-compatible o almacenamiento del proveedor administrado), para no perder backups si falla el mismo disco que la base.
- **Cifrado**: backups cifrados en reposo si el proveedor lo permite de forma nativa (la mayoría de los managed Postgres lo hacen por defecto).
- **Prueba de recuperación**: al menos una restauración de prueba antes de ir a producción, y luego periódicamente (ej. cada 3 meses), para no descubrir un backup corrupto el día que hace falta.

---

## 16. Deployment

**Ambientes:**

| Ambiente | Necesidad | Detalle |
|---|---|---|
| Development | Sí, desde el día uno | Docker Compose local (API + Postgres + Web), datos de prueba. |
| Staging | ⚠️ No indispensable para el MVP | Con un equipo de 2 personas y bajo volumen de cambios simultáneos, agregar staging ahora es más costo operativo que beneficio. Se recomienda **saltarlo inicialmente** y desplegar directo a producción con buena cobertura de tests (§18) y despliegues chicos y frecuentes. Se reevalúa si se suma un tercer desarrollador o el ritmo de cambios lo justifica. |
| Production | Sí | Ver más abajo. |

**Producción — opciones evaluadas:**

| Opción | Ventaja | Desventaja |
|---|---|---|
| **Railway / Render** (recomendado para arrancar) | Deploy desde Git, Postgres administrado incluido, HTTPS automático, muy bajo costo inicial, cero administración de servidores. | Menos control fino que un VPS; costo crece con el uso (aceptable para el tamaño actual). |
| VPS propio (Hetzner/DigitalOcean) + Docker Compose | Costo fijo más bajo a mediano plazo, control total. | Requiere mantener el servidor (updates, seguridad, backups manuales) — más trabajo operativo para un equipo de 2 personas sin un rol técnico dedicado a infraestructura. |
| Supabase (Postgres + Auth + Storage) | Todo-en-uno, incluye storage para comprobantes (§23) sin sumar otro proveedor. | Ata parte de la lógica de autenticación a su ecosistema si se usa su Auth — se recomienda usar Supabase solo como Postgres administrado + Storage, manteniendo la autenticación propia en NestJS (más control y consistencia con el resto de la arquitectura). |

**Recomendación confirmada**: **Railway** para API + Web, con Postgres administrado del mismo proveedor. Es la opción de menor fricción operativa para un equipo de 2 personas sin un rol dedicado a infraestructura: deploy directo desde Git, HTTPS automático, base de datos administrada incluida, y un costo inicial bajo que escala con el uso real. Variables de entorno gestionadas en el panel de Railway. Se migra a VPS propio más adelante solo si el costo o la necesidad de control lo justifican.

---

## 17. Git y GitHub

- **Repositorio único** (monorepo, §5).
- **Branch principal**: `main`, siempre desplegable.
- **Branches de trabajo**: ramas cortas por funcionalidad (`feature/trabajos-costos`, `fix/liquidacion-redondeo`), sin una rama `develop` separada — con un equipo de 2 personas, una rama de integración intermedia agrega fricción sin beneficio real.
- **Commits**: convención [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`) para que el historial sea legible y, a futuro, permita generar changelog automático.
- **Pull Requests**: obligatorios incluso siendo 2 personas — el otro socio (o uno mismo al día siguiente) revisa antes de mergear a `main`. Sirve además como bitácora de decisiones técnicas.
- **Issues**: uno por funcionalidad del MVP/Fase 2/Fase 3 (mapeados directamente a los módulos de la Parte 2 §20), para tener trazabilidad de qué falta.
- **Tags/versiones**: versionado semántico (`v0.1.0` al cierre del MVP, incrementos menores por Fase).

---

## 18. Testing

Estrategia mínima, priorizando lo que puede causar un error de dinero mal repartido (lo más costoso de un bug en este sistema):

| Prioridad | Qué testear | Tipo |
|---|---|---|
| 🔴 Crítica | Cálculo de Liquidación mensual (ganancia 50/50, reembolsos por `pagado_por`, retiros, saldo) | Unit tests |
| 🔴 Crítica | Cálculo de rentabilidad de un trabajo (Ingreso − Costos directos) | Unit tests |
| 🔴 Crítica | Que ningún flujo de `TrabajoParticipante` modifique `ConfiguracionParticipacion` | Unit/integration test específico ("test de regla de negocio") |
| 🟠 Alta | Endpoints de autenticación y permisos por rol | Integration tests (Supertest) |
| 🟠 Alta | Transiciones de estado del Trabajo (no permitir `Finalizado` sin `precio_final`, etc.) | Unit tests |
| 🟡 Media | CRUD estándar de Clientes, Gastos, Herramientas | Integration tests básicos |
| 🟢 Baja (frontend) | Formularios críticos (carga de trabajo, carga de costos) | Component tests (React Testing Library) |

No se apunta a cobertura total desde el MVP — se prioriza lo que involucra dinero y reglas societarias, que es donde un error sale caro y es difícil de detectar a simple vista.

---

## 19. Logging y monitoreo

- **Logging estructurado** con Pino: nivel `info` para operaciones normales, `warn`/`error` para fallos, incluyendo siempre `usuario_id` y `entidad` afectada cuando aplique (complementa al `AuditLog`, que es para historial de negocio, no para debugging técnico).
- **Salida**: a stdout, capturada por el proveedor de hosting (Railway/Render la muestran sin configuración adicional) — sin necesidad de un stack de logging centralizado (ELK, Datadog) para este tamaño de proyecto.
- **Monitoreo de errores**: ✅ definido — no se suma Sentry ni otra herramienta en el MVP. Se reevalúa más adelante, cuando el sistema esté en uso real y se pueda justificar el costo/beneficio.
- **Sin monitoreo de infraestructura dedicado** (Prometheus/Grafana) — sobreingeniería para el tamaño actual; el panel del proveedor de hosting alcanza para ver CPU/memoria/uptime.

---

## 20. Escalabilidad

La arquitectura modular (§5) permite incorporar, sin rediseñar lo existente:

- **Técnicos/empleados**: ya contemplado en `Rol` y `TrabajoParticipante` desde el modelo actual.
- **Stock y venta de insumos**: entidades ya identificadas (`Producto`, `Stock`, `Compra`, `Venta`) como módulo nuevo, sin tocar `Trabajo` ni `Gastos`.
- **Marketing avanzado / integraciones publicitarias**: `CampañaMarketing` y `LeadContacto` ya existen; solo falta activar el módulo y sumar clientes de API externos (Meta/Google Ads), probablemente vía n8n.
- **n8n**: preparado desde el diseño de eventos (§12) y autenticación por API Key (§9, §13).
- **CRM/reportes avanzados**: se construyen sobre el mismo modelo de datos, agregando vistas/queries, no entidades nuevas en su mayoría.
- **Facturación**: hoy fuera de alcance (Parte 1 §23, pendiente heredado); si se agrega, probablemente sume campos a `Ingreso` (`numero_comprobante`, IVA) sin romper el modelo actual.

El único cambio estructural previsible es si en algún momento el volumen justifica separar el módulo de Stock/Ventas en un servicio aparte — pero no antes de que el negocio lo necesite (consistente con Parte 1 §20, "no sobrearquitecturar").

---

## 21. MVP técnico

Componentes técnicos indispensables para la primera versión funcional (alineado con Parte 2 §20):

- Backend NestJS con los módulos: `auth`, `usuarios`, `clientes`, `trabajos` (incluye costos y participantes), `ingresos`, `gastos`, `vehiculos`, `herramientas`, `socios`, `liquidacion` (incluye retiros), `dashboard`, `auditoria`.
- Schema Prisma completo para todas las entidades del MVP (§6, excluyendo las marcadas "Fase 2/3").
- Autenticación JWT con un solo rol activo (Admin/Socio), pero con la infraestructura de roles/guards ya en su lugar.
- Frontend React con las pantallas de: login, clientes, trabajos (alta/edición/detalle con costos y participantes), gastos, vehículo, dashboard, liquidación mensual.
- Docker Compose para desarrollo local.
- CI básico en GitHub Actions: lint + tests + build en cada Pull Request.
- Backups diarios automáticos desde el día del *go-live* (septiembre).
- Logging estructurado básico (Pino).

**Explícitamente fuera del MVP técnico**: staging, integración con n8n, storage de archivos (comprobantes quedan sin adjuntar hasta que se resuelva §23), Sentry/monitoreo de errores, roles Técnico/Administrativo activos, módulo de Stock/Ventas, marketing avanzado.

---

## 22. Riesgos técnicos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Error en el cálculo de Liquidación mensual (dinero mal repartido entre socios) | Alto — es dinero real entre los dos dueños del negocio | Tests unitarios exhaustivos sobre este cálculo específico (§18), y que el cálculo viva en un único lugar del código (no duplicado en frontend y backend). |
| Falta de staging | Medio | Compensado con buena cobertura de tests y despliegues chicos y frecuentes; se reevalúa si el ritmo de cambios crece. |
| Dependencia de un solo desarrollador/equipo chico (bus factor) | Medio | Documentación mantenida junto al código (Partes 1-2-3 en `docs/`), commits descriptivos, código simple antes que "inteligente". |
| Backups sin probar | Alto si ocurre, bajo si se mitiga | Prueba de restauración obligatoria antes de producción y cada 3 meses (§15). |
| Costo de hosting creciente con el uso | Bajo/Medio | Empezar en un plan gratuito o de entrada de Railway/Render; migrar a VPS si el costo lo justifica (§16). |
| Cambios futuros de API de Meta/Google Ads | Bajo (Fase 3, no MVP) | Se delega a n8n cuando corresponda, aislando al ERP de esos cambios. |
| Migración de "Presupuesto como estado" a "Presupuesto como entidad separada" si el negocio lo necesita más adelante | Medio | Los campos actuales (`precio_presupuestado`, `estado_comercial`) son fácilmente migrables a una tabla nueva sin perder datos históricos, si llegara a hacer falta. |
| Falta de storage para comprobantes | Bajo | No bloquea el MVP; se resuelve cuando haga falta (§23). |

---

## 23. Decisiones pendientes

**Técnicas — ya resueltas:**

1. ✅ **Storage de comprobantes**: no se implementa todavía. `comprobante_url` queda como campo opcional sin uso activo hasta que haga falta.
2. ✅ **Hosting de producción**: Railway (API + Web + Postgres administrado).
3. ✅ **Monitoreo de errores**: no se suma Sentry (ni otra herramienta) en el MVP — se reevalúa más adelante, cuando el sistema esté en uso real.

**Técnica — sigue abierta (no bloqueante):**

4. **Herramientas de monorepo** (Nx/Turborepo) vs. `npm workspaces` simple: se mantiene la recomendación de empezar simple (`npm workspaces`, ya reflejado en §5) y evaluar si hace falta más adelante.

**Heredadas de la Parte 1, sin cambios (decisiones de negocio, no técnicas — se listan para no perderlas de vista):**

- % exacto de service del vehículo por evento (mecanismo ya definido: editable caso por caso).
- Situación fiscal / facturación.
- Ajuste por inflación en comparativas históricas.
- Límite de aprobación de gastos entre socios.
- Margen sobre materiales cobrados al cliente.
- Trabajos cancelados con costos ya incurridos.
- Fecha exacta de corte de septiembre.

Ninguna de estas decisiones pendientes bloquea el comienzo del desarrollo del MVP descripto en §21.

---

## Próximo paso

Con esta Parte 3 revisada y aprobada, el siguiente documento es la **Parte 4: Plan de Desarrollo y MVP**, donde se traduce todo lo anterior en un plan de trabajo concreto (tareas, orden de construcción, hitos) para empezar a programar.
