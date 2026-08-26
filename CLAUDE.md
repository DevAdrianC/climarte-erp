# CLAUDE.md

Guía para agentes que trabajan en este repositorio.

## Qué es

**CLIMARTE ERP** — ERP interno de CLIMARTE (instalación, reparación y mantenimiento de climatización y refrigeración). El código implementa el sistema descripto en `docs/01` a `docs/04`.

El dominio, los nombres de entidades, los endpoints y los comentarios están en **español**. Mantené esa convención al escribir código nuevo.

## Fuente de verdad del progreso

**`docs/sprints/` es la única fuente de verdad sobre qué está hecho y qué falta.** Un archivo por sprint (`sprint-1.md`, `sprint-2.md`, …), con objetivos, alcance, entidades, endpoints, tests y pendientes.

- Antes de empezar cualquier tarea, leé `docs/sprints/` y el estado en `README.md`.
- **No asumas contexto de conversaciones previas.** Si algo no está en `docs/sprints/`, en los documentos de `docs/` o en el código, no lo des por hecho: verificalo o preguntá.
- Al terminar trabajo de un sprint, actualizá su archivo en `docs/sprints/` y la tabla de estado del `README.md`. No dejes que el código y la documentación se desincronicen en silencio.
- `docs/01` a `docs/04` son los documentos de análisis, especificación funcional, arquitectura técnica y plan de MVP. Toda decisión de negocio o técnica debe rastrearse a ellos. Si el código y la documentación entran en conflicto, se corrige el código (o se actualiza la documentación de forma explícita).

## Stack

**Backend (`apps/api`)** — NestJS 10, Prisma 5, PostgreSQL 16, JWT (`@nestjs/jwt` + Passport), bcrypt, class-validator / class-transformer, Swagger (`/api/docs`), Pino (`nestjs-pino`), Helmet, `@nestjs/throttler`, Jest.

**Frontend (`apps/web`)** — React 18, Vite 5, TypeScript, Tailwind 3, React Router 6, TanStack Query 5, React Hook Form, Axios.

**Infra** — Docker Compose (Postgres + api + web), npm workspaces.

## Estructura del monorepo

```
climarte-erp/
├── docs/                    # 01–04: análisis, funcional, arquitectura, plan de MVP
│   └── sprints/             # FUENTE DE VERDAD del progreso (uno por sprint)
├── apps/
│   ├── api/                 # NestJS + Prisma
│   │   ├── prisma/          # schema.prisma, migrations/, seed.ts
│   │   └── src/
│   │       ├── common/      # guards (jwt, roles), decorators (@Roles, @CurrentUser)
│   │       ├── prisma/      # PrismaModule / PrismaService
│   │       └── modules/     # auth, usuarios, socios, clientes, trabajos, catalogos
│   └── web/                 # React + Vite + Tailwind
│       └── src/
│           ├── api/         # AuthContext, cliente HTTP
│           ├── components/  # Layout, Modal, Badge, RutaProtegida
│           └── pages/       # Dashboard, Login, clientes/, trabajos/
└── packages/
    └── shared/              # declarada como workspace, HOY VACÍA — nadie la importa
```

Cada módulo del backend sigue el mismo patrón: `*.module.ts`, `*.controller.ts`, `*.service.ts` y una carpeta `dto/` con clases validadas por `class-validator`.

## Levantar el proyecto

```bash
# 1. Copiar .env.example a .env en la raíz y en apps/web, y completar los secretos de JWT.

# 2. Levantar todo
docker compose up
#    API:     http://localhost:3000/api
#    Swagger: http://localhost:3000/api/docs
#    Web:     http://localhost:5173

# 3. Migraciones y seed (primera vez, o cuando cambie el schema)
cd apps/api
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

Sin Docker: `npm run dev:api` y `npm run dev:web` desde la raíz (requiere un Postgres accesible en `DATABASE_URL`).

Otros scripts de la raíz: `npm run lint`, `npm run test:api`, `npm run build:api`, `npm run build:web`, `npm run prisma:generate|migrate|seed`.

Usuarios del seed: `nahuel@climarte.com.ar` y `adrian@climarte.com.ar`, password `climarte2026`.

## Reglas de negocio no negociables

Están testeadas explícitamente. No las rompas ni las "optimices":

1. **Participación societaria ≠ productividad.** Asignar a alguien como participante de un trabajo **nunca** debe escribir en `ConfiguracionParticipacion`. La única forma de modificar la participación societaria es `SociosService.crearNuevaConfiguracion()`. Tests: `socios.service.spec.ts`, `trabajos.service.spec.ts`.
2. **Toda configuración de participación suma exactamente 100%**, es versionada (`vigenteDesde` / `vigenteHasta`) y cierra la anterior en la misma transacción. Nunca se edita ni se borra una versión existente.
3. **La mano de obra de los socios nunca es un costo.** Por eso el enum `TipoCosto` no tiene un valor para eso.
4. **Un trabajo no se finaliza sin `precioFinal`.**
5. **Los tres estados del trabajo son independientes** entre sí (comercial, operativo, pago). No los acoples.

## Convenciones

- Prisma: campos en `camelCase` en el schema, mapeados a `snake_case` en la base con `@map` / `@@map`.
- Importes y porcentajes son `Decimal`, nunca `Float`.
- Los servicios lanzan `NotFoundException` / `BadRequestException` de NestJS; los controllers no validan a mano (eso es de los DTOs).
- Todos los controllers de negocio van con `@UseGuards(JwtAuthGuard, RolesGuard)` y anotados para Swagger.
