# 04 — CLIMARTE ERP — Plan de Desarrollo y MVP

**Fuentes obligatorias**: Partes 1 (Análisis y Arquitectura), 2 (Especificación Funcional) y 3 (Arquitectura Técnica), todas ya aprobadas. Este documento no reabre ninguna decisión — la traduce en un plan de trabajo ejecutable.

---

## 0. Contradicciones detectadas antes de continuar

Este documento (Parte 4, tal como se recibió) sugiere una estructura de sprints que en dos puntos **no coincide** con lo ya aprobado en las Partes 2 y 3. Se señalan y se resuelven a favor de lo ya aprobado, sin reabrir la decisión:

1. **Leads en el MVP**: la Parte 4 propone un "Sprint 2 — Clientes y contactos" que incluye Leads. Pero la Parte 2 (§20) y la Parte 3 (§21, "MVP técnico") ya definieron explícitamente que **Leads queda en Fase 2 / v1.1, no en el MVP** — el módulo `leads` ni siquiera está en la lista de módulos backend del MVP técnico. **Resolución**: Sprint 2 se limita a Clientes; Leads pasa a la v1.1 del roadmap (sección 9).
2. **Presupuestos como sprint separado**: la Parte 4 propone un "Sprint 4 — Presupuestos" como si fuera una funcionalidad aparte. Pero la Parte 2 (§4.1, Opción A confirmada) ya definió que el presupuesto **no es una entidad ni un módulo separado** — es un estado (`estado_comercial`) dentro del mismo `Trabajo`. **Resolución**: no existe un sprint de "Presupuestos" independiente; ese trabajo queda incluido dentro del Sprint de Trabajos (Sprint 3).
3. **"Caja" como funcionalidad del MVP** (Parte 4 §2): la Parte 3 (§7 de la Parte 2, y §6 técnico) ya definió que Caja **no es una tabla ni un módulo propio**, sino un reporte derivado de Ingresos, Gastos y Liquidación mensual. **Resolución**: no hay sprint ni entidad "Caja" — queda cubierta dentro del Sprint de Liquidación/Resultado económico.
4. **App móvil** (Parte 4 §8, funcionalidades post-MVP): este ítem no estaba mencionado en ninguna de las Partes 1 a 3. No contradice nada — simplemente se incorpora como una posibilidad post-MVP nueva, sin definir alcance todavía (ver sección 8).

Con estas tres resoluciones, el plan de sprints que sigue queda alineado al 100% con las Partes 1, 2 y 3.

---

## 1. Resumen ejecutivo

El MVP de CLIMARTE ERP se construye en **8 sprints**, pensados para un equipo de 2 personas trabajando de forma incremental, con la meta de tener el sistema operativo para **septiembre** (fecha de arranque ya definida en la Parte 1, con saldo de cobros pendientes en cero). Cada sprint entrega algo usable, no solo código — se prioriza poder cargar datos reales de CLIMARTE lo antes posible para validar el modelo con la operación real del negocio.

---

## 2. Alcance del MVP

Funcionalidades mínimas indispensables (ya aprobadas en Partes 2 §20 y 3 §21), agrupadas según lo que pide la Parte 4 §2:

| Área pedida en Parte 4 §2 | Cómo se resuelve (ya aprobado) |
|---|---|
| Clientes | Módulo `clientes` completo. |
| Trabajos | Módulo `trabajos` completo, con costos y participantes. |
| Presupuestos | **No es un módulo aparte** — es el `estado_comercial` del Trabajo (ver contradicción #2). |
| Gastos | Módulos `gastos` (fijos/variables) + `vehiculos` (combustible/service) + costos directos dentro de `trabajos`. |
| Ingresos | Módulo `ingresos`, criterio percibido. |
| Caja | **No es un módulo aparte** — reporte derivado (ver contradicción #3), se muestra en Dashboard y Liquidación. |
| Resultado económico | Módulo `liquidacion` (ganancia por mano de obra, reembolsos, saldo). |
| Distribución 50/50 | Módulo `socios` (`ConfiguracionParticipacion`) + `liquidacion`. |
| Dashboard básico | Módulo `dashboard`. |

**Funcionalidades adicionales incluidas en el MVP** (no pedidas explícitamente en la lista de Parte 4 §2, pero ya aprobadas como parte del MVP en Partes 2 y 3, y necesarias para que el sistema sea realmente usable desde el primer día):

- **Herramientas/equipos** (registro simple) — Parte 2 §20: son parte del aporte de Nahuel, y sin esto no se cumple el objetivo de "administrar correctamente el negocio" de la Parte 1.
- **Auditoría básica** — indispensable desde el día uno por ser un sistema con dos socios manejando dinero en conjunto (Parte 1 §22, transparencia societaria).
- **Garantía de 3 meses** — dato que se carga junto con cada trabajo, sin costo de desarrollo adicional relevante (Parte 2 §3.6).
- **Retiros de socios** (`RetiroSocio`) — sin esto, el "resultado económico" y la "distribución 50/50" pedidos explícitamente en la Parte 4 §2 quedarían incompletos (no se podría saber el saldo pendiente real de cada socio).

No se incluye nada más allá de esto — Leads, roles Técnico/Administrativo, marketing, stock y automatizaciones quedan fuera del MVP (sección 8).

---

## 3. Plan de sprints

### Sprint 1 — Fundación técnica

**Objetivo**: dejar la base del proyecto lista para que los sprints siguientes sean solo funcionalidad de negocio, sin decisiones técnicas pendientes.

**Funcionalidades**: repositorio y monorepo (`npm workspaces`), Docker Compose de desarrollo, esquema inicial de Prisma, autenticación JWT, infraestructura de roles/guards (aunque solo exista el rol Admin/Socio), layout base del frontend (login, navegación, shell de páginas), configuración de entornos (`.env`), CI básico (lint + test + build en GitHub Actions).

**Entidades**: `Usuario`, `Rol`, `ConfiguracionParticipacion`.

**Endpoints**: `POST /api/auth/login`, `POST /api/auth/refresh`, `GET/POST /api/config-participacion`.

**Interfaces**: pantalla de login, layout general (header, navegación lateral), pantalla vacía de "próximamente" para cada módulo futuro (placeholder de navegación).

**Criterios de aceptación**:
- Un usuario Admin/Socio puede loguearse y recibir un JWT válido.
- El token vence y se renueva correctamente vía refresh.
- Existe al menos un registro de `ConfiguracionParticipacion` cargado (Nahuel 50% / Adrián 50%) desde una migración/seed inicial.
- El proyecto corre completo en local con un solo comando (`docker compose up`).

**Pruebas**: login exitoso/fallido, expiración de token, seed de participación societaria correcto (suma 100).

**Dependencias**: ninguna — es la base de todo lo demás.

---

### Sprint 2 — Clientes

*(Leads queda excluido del MVP, ver contradicción #1 — pasa a v1.1, sección 9.)*

**Objetivo**: tener una base de clientes operativa antes de poder cargar trabajos.

**Funcionalidades**: alta, edición, búsqueda (nombre/teléfono/localidad), ficha de cliente con historial de trabajos (vacío por ahora, se completa en Sprint 3).

**Entidades**: `Cliente`.

**Endpoints**: `GET/POST /api/clientes`, `GET /api/clientes/:id`, `PATCH /api/clientes/:id`, `GET /api/clientes/:id/trabajos`.

**Interfaces**: listado de clientes con buscador, formulario de alta/edición, ficha de cliente.

**Criterios de aceptación**: un cliente puede crearse, editarse, buscarse por nombre/teléfono, y su ficha muestra (aunque vacío todavía) el espacio para el historial de trabajos.

**Pruebas**: alta/edición/búsqueda funcional; validación de campos obligatorios (nombre, teléfono).

**Dependencias**: Sprint 1 (auth).

---

### Sprint 3 — Trabajos

*(Incluye el ciclo completo comercial + operativo — sin sprint separado de "Presupuestos", ver contradicción #2.)*

**Objetivo**: el núcleo operativo del sistema — poder registrar un trabajo de punta a punta, desde la consulta hasta la finalización.

**Funcionalidades**: alta de trabajo, tres estados independientes (`estado_comercial`, `estado_operativo`, `estado_pago`), asignación de responsables/participantes (Nahuel, Adrián, conjunto, colaborador externo), carga de costos (`materiales`, `transporte`, `mano_obra_externa`, `otro` — con `pagado_por`), garantía (3 meses por defecto), transición de estados, validación de que no se puede finalizar sin `precio_final`.

**Entidades**: `Trabajo`, `TrabajoParticipante`, `ColaboradorExterno`, `CostoTrabajo`, `TipoServicio`, `TipoEquipo`.

**Endpoints**: `GET/POST /api/trabajos`, `GET /api/trabajos/:id`, `PATCH /api/trabajos/:id/estado-comercial`, `PATCH /api/trabajos/:id/estado-operativo`, `PATCH /api/trabajos/:id/finalizar`, `POST /api/trabajos/:id/participantes`, `POST /api/trabajos/:id/costos`.

**Interfaces**: listado de trabajos con filtro por estado, formulario de alta/edición, detalle de trabajo (con costos y participantes cargables desde la misma pantalla), cambio de estado.

**Criterios de aceptación** (calcado del ejemplo de la Parte 4 §4, ya cumplido por diseño):
- Puede crearse y editarse.
- Tiene cliente, tipo de equipo, tipo de servicio.
- Tiene los tres estados de forma independiente.
- Tiene responsables/participantes (uno, varios, o con colaborador externo).
- Registra costos con `pagado_por`.
- Puede finalizarse (exige `precio_final`).
- Queda listo para asociarse a un cobro (Sprint 5).
- **Asignar participantes a un trabajo nunca modifica `ConfiguracionParticipacion`** (regla no negociable, testeada explícitamente).

**Pruebas**: transición de estados (no permitir Finalizado sin precio final), trabajo individual vs. conjunto vs. con colaborador externo, costos con y sin `pagado_por`, test específico de que la participación societaria no se altera.

**Dependencias**: Sprint 1 (auth), Sprint 2 (clientes).

---

### Sprint 4 — Gastos, Vehículo y Herramientas

**Objetivo**: cubrir todos los gastos del emprendimiento que no dependen de un trabajo puntual, más los que sí (combustible/service del vehículo).

**Funcionalidades**: gastos fijos (con periodicidad y categoría), gastos variables (con categoría, proveedor y `trabajo_id` opcional), categorías configurables, registro de combustible (con `trabajo_id` opcional, gasto general si no aplica), registro de service (con % configurable por evento), registro de herramientas/equipos.

**Entidades**: `GastoFijo`, `GastoVariable`, `CategoriaGasto`, `Proveedor`, `Vehiculo`, `RegistroCombustible`, `RegistroService`, `Herramienta`.

**Endpoints**: `GET/POST /api/gastos-fijos`, `GET/POST /api/gastos-variables`, `GET /api/categorias-gasto`, `GET/POST /api/vehiculos/:id/combustible`, `GET/POST /api/vehiculos/:id/service`, `GET/POST /api/herramientas`.

**Interfaces**: listado y alta de gastos fijos/variables, pantalla de vehículo (combustible + service), listado de herramientas.

**Criterios de aceptación**: un gasto fijo se carga con categoría e importe mensual; un gasto variable puede o no asociarse a un trabajo (y eso determina si es costo directo o gasto general); el combustible sin trabajo asociado queda como gasto general del vehículo; el % de service es editable por evento.

**Pruebas**: distinción correcta costo directo vs. gasto general según presencia de `trabajo_id`; cálculo de `importe_atribuido` del service según el % cargado.

**Dependencias**: Sprint 1 (auth), Sprint 3 (para poder asociar gastos variables/combustible a un trabajo, aunque el módulo funciona igual sin esa asociación).

---

### Sprint 5 — Ingresos y Liquidación mensual

*(Cubre "Ingresos", "Caja", "Resultado económico" y "Distribución 50/50" de la Parte 4 §2 — ver contradicción #3.)*

**Objetivo**: el corazón económico del sistema — poder cobrar un trabajo y saber cuánto le corresponde a cada socio en cualquier momento.

**Funcionalidades**: registro de cobro (criterio percibido, con fecha propia y `estado_pago`), cálculo de rentabilidad por trabajo (Ingreso − Costos directos), cálculo de Liquidación mensual (ganancia por mano de obra repartida 50/50 + reembolsos por `pagado_por` + retiros ya realizados = saldo pendiente por socio), registro de retiros.

**Entidades**: `Ingreso`, `RetiroSocio`.

**Endpoints**: `POST /api/trabajos/:id/ingresos`, `GET /api/liquidacion?periodo=YYYY-MM`, `POST /api/retiros`.

**Interfaces**: registro de cobro desde el detalle de trabajo, pantalla de Liquidación mensual (con desglose de ganancia, reembolsos, retiros y saldo por socio), formulario de retiro.

**Criterios de aceptación**: un trabajo finalizado puede cobrarse (total o parcial); la Liquidación mensual muestra correctamente los cuatro componentes definidos en la Parte 2 §9 (ganancia 50/50, reembolsos, retiros, saldo pendiente); el cálculo nunca reparte 50/50 los reembolsos ni al revés.

**Pruebas** (🔴 prioridad crítica según Parte 3 §18): cálculo de Liquidación mensual con casos de ejemplo verificados a mano, cálculo de rentabilidad por trabajo, verificación de que la mano de obra de los socios nunca aparece como `CostoTrabajo`.

**Dependencias**: Sprint 3 (Trabajos), Sprint 4 (Gastos, para los costos directos con `pagado_por`).

---

### Sprint 6 — Dashboard

**Objetivo**: dar visibilidad diaria de la operación sin tener que entrar a cada módulo.

**Funcionalidades**: los indicadores ya definidos en Parte 2 §12 (ingresos/gastos/costos directos/resultado del mes, trabajos realizados/pendientes, presupuestos pendientes, dinero pendiente de cobro, resultado 50/50 estimado, gastos fijos/variables).

**Entidades**: ninguna nueva — es una capa de agregación sobre las existentes.

**Endpoints**: `GET /api/dashboard/resumen?periodo=YYYY-MM`.

**Interfaces**: pantalla principal del sistema (landing tras el login), con los indicadores priorizados por la Parte 1 §17.

**Criterios de aceptación**: todos los indicadores de la Parte 2 §12 se muestran correctamente para el mes seleccionado, sin sobrecargar la pantalla con métricas no pedidas.

**Pruebas**: exactitud de cada indicador contra datos de prueba cargados manualmente (sección 5).

**Dependencias**: Sprints 3, 4 y 5 (necesita datos de trabajos, gastos e ingresos para tener algo que mostrar).

---

### Sprint 7 — Reportes y Auditoría

**Objetivo**: dar profundidad de análisis más allá del resumen del dashboard, y trazabilidad de cambios.

**Funcionalidades**: reportes de rentabilidad por trabajo/servicio/equipo, trabajos por socio, trabajos conjuntos, cobros pendientes; consulta de auditoría.

**Entidades**: `AuditLog` (ya alimentado desde Sprint 1 en adelante vía interceptor transversal — este sprint construye la **consulta**, no el registro, que ya viene funcionando desde antes).

**Endpoints**: `GET /api/reportes/rentabilidad?agrupar_por=...`, `GET /api/auditoria`.

**Interfaces**: pantalla de reportes con filtros, pantalla de auditoría (solo lectura).

**Criterios de aceptación**: los reportes de la Parte 2 §13 devuelven datos correctos y consistentes con el dashboard; la auditoría muestra quién hizo cada cambio relevante con fecha y valores antes/después.

**Pruebas**: exactitud de agrupaciones, acceso restringido de auditoría solo a Admin/Socio.

**Dependencias**: Sprints 3, 4, 5, 6.

---

### Sprint 8 — Calidad y preparación para producción

**Objetivo**: cerrar el MVP con confianza suficiente para operar con dinero real desde septiembre.

**Funcionalidades**: carga de datos de prueba (sección 5), corrida completa de la batería de pruebas (sección 6), revisión de seguridad (Parte 3 §14), configuración de backups automáticos (Parte 3 §15), deploy a Railway (Parte 3 §16), checklist de "Done" (sección 7) aplicado a todos los sprints anteriores.

**Entidades**: ninguna nueva.

**Endpoints**: ninguno nuevo — validación end-to-end de todos los anteriores.

**Interfaces**: revisión general de UX de las pantallas ya construidas (consistencia, mensajes de error, estados de carga).

**Criterios de aceptación**: el sistema completo corre en producción (Railway), con HTTPS, backups diarios activos y verificados, y sin errores críticos conocidos.

**Pruebas**: batería completa (sección 6), prueba de restauración de un backup.

**Dependencias**: todos los sprints anteriores.

---

## 4. Criterios de aceptación por módulo (resumen)

| Módulo | Criterio mínimo de "correctamente implementado" |
|---|---|
| Clientes | Alta, edición, búsqueda, historial de trabajos visible. |
| Trabajos | Los 8 criterios detallados en el Sprint 3. |
| Gastos | Distinción automática costo directo/gasto general según `trabajo_id`. |
| Vehículo | Combustible con/sin trabajo asociado; % de service editable y trazado. |
| Ingresos | Criterio percibido respetado; asociación correcta a trabajo y cliente. |
| Liquidación | Los 4 componentes (ganancia, reembolsos, retiros, saldo) calculados correctamente y por separado. |
| Dashboard | Todos los indicadores de Parte 2 §12 presentes y exactos. |
| Reportes | Coinciden con los datos del dashboard y de cada módulo fuente. |
| Auditoría | Registra automáticamente creación/modificación de entidades sensibles, sin intervención manual. |

---

## 5. Datos de prueba

Set ficticio (sin datos reales de personas) para validar el sistema durante el desarrollo y antes del *go-live*:

**Clientes** (5): "María G." (Resistencia), "Carlos P." (Barranqueras), "Ferretería El Tornillo SRL" (Resistencia), "Laura M." (Fontana), "Restaurante La Parrilla" (Resistencia).

**Trabajos de ejemplo**:
1. **Instalación de aire acondicionado** — cliente María G., realizado por Nahuel solo, mano de obra $150.000, materiales $80.000 (pagado por Nahuel), transporte $10.000 (pagado por Nahuel), estado: Finalizado / Cobrado.
2. **Limpieza de aire acondicionado** — cliente Laura M., trabajo conjunto Nahuel + Adrián, mano de obra $25.000, transporte $5.000 (pagado por Adrián), estado: Finalizado / Pendiente de cobro.
3. **Reparación de heladera** — cliente Carlos P., realizado por Adrián solo, con colaborador externo (electricista) pagado $20.000, mano de obra $40.000, materiales $15.000 (pagado por Adrián), estado: Finalizado / Cobrado parcial.
4. **Reparación de freezer** — cliente Restaurante La Parrilla, en estado Presupuesto enviado (todavía no aprobado), precio presupuestado $60.000.
5. **Mantenimiento de lavarropas** — cliente Ferretería El Tornillo, en estado Programado.

**Gastos**: alquiler $500.000 (fijo, mensual), factura de internet $15.000 (fijo), tornillos y cables $8.000 (variable, sin trabajo asociado), combustible de una jornada sin trabajo puntual $12.000 (gasto general del vehículo).

**Service del vehículo**: importe total $90.000, 40% atribuido → $36.000.

**Retiros**: Nahuel retira $50.000, Adrián retira $30.000, en el mismo período.

Con este set, la Liquidación mensual del período de prueba debería poder calcularse a mano y compararse contra el resultado del sistema — es el primer test de aceptación real antes de cargar datos de CLIMARTE en producción.

---

## 6. Plan de pruebas

Alineado con la estrategia de la Parte 3 §18, con foco especial en lo pedido por la Parte 4 §6:

| Tipo | Qué cubre | Cuándo se corre |
|---|---|---|
| Funcionales | CRUD de cada módulo, flujos de pantalla | Al cierre de cada sprint |
| Permisos | Ningún endpoint accesible sin JWT válido; roles futuros no rompen nada hoy | Sprint 1 y regresión en cada sprint |
| Reglas de negocio | Participación societaria nunca se modifica por participar de un trabajo; mano de obra de socios nunca es costo; ingreso en criterio percibido | Sprint 3, 5 — regresión constante |
| Cálculos | Rentabilidad por trabajo, Liquidación mensual (ganancia/reembolsos/retiros/saldo), % de service | Sprint 5 — con los datos de prueba de la sección 5 |
| Navegación | Flujos completos de usuario (Parte 2 §19): cliente nuevo, trabajo, liquidación mensual | Sprint 8 |

**Prioridad especial** (calcado de la Parte 4 §6 y ya presente en la Parte 3 §18): todo lo que toca dinero repartido entre los dos socios se prueba con más de un caso, incluyendo casos límite (trabajo sin costos, trabajo con varios colaboradores externos, reembolso a un socio que no participó del trabajo).

---

## 7. Definición de "Done"

Un sprint se considera terminado cuando:

1. Las funcionalidades listadas están implementadas y desplegadas en el ambiente de desarrollo.
2. Los criterios de aceptación del sprint (sección 3) se cumplen, verificado manualmente por al menos uno de los dos socios.
3. Las pruebas correspondientes (sección 6) pasan, incluyendo las de regresión de sprints anteriores.
4. No quedan errores críticos conocidos (que impidan operar o que involucren cálculo de dinero incorrecto).
5. La documentación de este plan (o las Partes 1-3 si algo cambió) se actualiza si hubo algún ajuste durante el sprint.
6. El código está mergeado a `main` vía Pull Request revisado (Parte 3 §17).

---

## 8. Funcionalidades post-MVP

No se desarrollan hasta después del MVP, ya definidas como tales en las Partes 2 y 3:

| Funcionalidad | Fase/versión (sección 9) |
|---|---|
| Leads y canalización comercial | v1.1 |
| Roles Técnico y Administrativo activos | v1.1 |
| Tareas administrativas (`TareaAdministrativa`) | v1.1 |
| Transporte por kilómetros (automático) | v1.1 |
| Reportes de rentabilidad avanzados | v1.1 |
| Inventario y venta de insumos (Producto, Stock, Compra, Venta) | v1.2 |
| Automatizaciones con n8n | v2.0 |
| Integración con WhatsApp/Email | v2.0 (vía n8n) |
| Integración con Meta Ads / Google Ads | v2.0 |
| CRM avanzado | v2.0 |
| Marketing y campañas con métricas de retorno | v2.0 |
| RRHH básico (empleados, equipos de trabajo) | v2.0 |
| Facturación electrónica | ⚠️ sin fase asignada — depende de una decisión de negocio pendiente (situación fiscal, heredada de la Parte 1) |
| App móvil | ⚠️ sin fase asignada — no estaba contemplada en las Partes 1-3; se evalúa si hace falta una app nativa o si el sistema web responsive alcanza, una vez que el equipo la use en el día a día |

---

## 9. Roadmap

**MVP** *(Sprints 1-8, meta: operativo para septiembre)*
Operación diaria completa: clientes, trabajos, gastos, ingresos, liquidación 50/50, dashboard, reportes básicos, auditoría.

**v1.1 — Mejoras administrativas**
Leads y canalización comercial, roles Técnico/Administrativo, tareas administrativas de Adrián, transporte por km, reportes de rentabilidad avanzados.

**v1.2 — Inventario y venta de insumos**
Productos, stock, compras, proveedores (evolución del módulo ya existente), ventas.

**v2.0 — Automatizaciones e integraciones**
n8n, WhatsApp/Email (vía n8n), Meta/Google Ads, CRM, marketing con métricas de retorno, RRHH básico.

Coherente con el roadmap de 7 fases de la Parte 1 §9 y su condensación en 3 niveles de la Parte 2 §20: MVP = Fase 1; v1.1 = Fases 2-3; v1.2 = Fase 6; v2.0 = Fases 4, 5 y 7.

---

## 10. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Subestimar el esfuerzo de los sprints por ser un equipo chico trabajando de forma no full-time | Medio — corre la fecha de septiembre | Sprints con alcance acotado y priorizado (lo crítico primero); si hace falta, se puede recortar Sprint 7 (Reportes) sin bloquear el *go-live*, dejándolo para justo después. |
| Errores en el cálculo de Liquidación mensual detectados recién con datos reales | Alto | Validar exhaustivamente con los datos de prueba de la sección 5 *antes* de cargar datos reales de CLIMARTE (Sprint 8). |
| Cambios de alcance durante el desarrollo ("ya que estamos, agreguemos...") | Medio | Cualquier funcionalidad nueva se evalúa contra el roadmap (sección 9) antes de sumarla a un sprint en curso — si no es del MVP, se anota para v1.1+. |
| Los mismos riesgos técnicos ya identificados en la Parte 3 §22 (bus factor, backups sin probar, dependencia de un solo proveedor de hosting) | Ver Parte 3 §22 | Se heredan sin cambios — no se repiten acá en detalle. |

---

## 11. Próximos pasos

**Primer sprint a desarrollar**: **Sprint 1 — Fundación técnica**, tal como está definido en la sección 3. No tiene sentido empezar por ningún módulo de negocio sin esto resuelto primero.

**Archivos y comandos iniciales para arrancar** (siguiendo la estructura de la Parte 3 §5):

```bash
mkdir climarte-erp && cd climarte-erp
git init

# Monorepo con npm workspaces
npm init -y
mkdir -p apps/api apps/web packages/shared

# Backend
npx @nestjs/cli new apps/api --package-manager npm --skip-git
cd apps/api
npm install @prisma/client prisma bcrypt @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer @nestjs/swagger @nestjs/config @nestjs/throttler helmet pino nestjs-pino
npx prisma init
cd ../..

# Frontend
npm create vite@latest apps/web -- --template react-ts
cd apps/web
npm install react-router-dom @tanstack/react-query react-hook-form tailwindcss
cd ../..

# Docker Compose de desarrollo (crear docker-compose.yml manualmente con servicios api, web, db)

# CI
mkdir -p .github/workflows   # agregar ci.yml con lint + test + build

git add .
git commit -m "chore: fundación técnica del proyecto (Sprint 1)"
```

A partir de acá, el primer trabajo real dentro del Sprint 1 es: definir `schema.prisma` con `Usuario`, `Rol`, `ConfiguracionParticipacion`, correr la primera migración, y construir el endpoint de login.

Con el plan aprobado, el desarrollo puede arrancar directamente por el Sprint 1.
