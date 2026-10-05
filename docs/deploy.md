# Deploy — Climarte ERP

El sistema está desplegado en [Railway](https://railway.com), en el proyecto **"producción"**, con 3 servicios dentro de un mismo proyecto.

## Servicios

| Servicio             | Qué es                    | URL pública                                                  |
| -------------------- | ------------------------- | ------------------------------------------------------------ |
| `climarte-erp`       | Backend (NestJS + Prisma) | https://climarte-erp-production.up.railway.app               |
| `fulfilling-renewal` | Frontend (React + Vite)   | https://fulfilling-renewal-production-565b.up.railway.app    |
| `Postgres`           | Base de datos             | Sin URL pública, solo accesible entre servicios del proyecto |

El link que se comparte para usar el sistema a diario es el del **frontend**.

## Cómo se despliega

Ambos servicios (`climarte-erp` y `fulfilling-renewal`) están conectados a la rama `main` del repo de GitHub (`DevAdrianC/climarte-erp`). Cada `git push` a esa rama dispara un redeploy automático en Railway — no hace falta hacer nada manual en Railway para desplegar cambios de código.

**Nota:** hoy Railway reconstruye ambos servicios en cada push, aunque el cambio sea solo en `apps/api` o solo en `apps/web`. Se puede optimizar configurando "Watch Paths" por servicio (pendiente, no urgente).

### Backend (`climarte-erp`)

- **Directorio raíz**: `apps/api`
- **Dockerfile**: `apps/api/Dockerfile` (de producción: compila con `npm run build` y, al arrancar el contenedor, corre `npx prisma migrate deploy` automáticamente antes de levantar el servidor — así cualquier migración nueva se aplica sola en cada deploy, sin pasos manuales).
- **Variables de entorno**: `DATABASE_URL` (referencia automática a `${{Postgres.DATABASE_URL}}`), `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `PORT`, `CORS_ORIGIN` (URL del frontend).

### Frontend (`fulfilling-renewal`)

- **Directorio raíz**: `apps/web`
- **Dockerfile**: `apps/web/Dockerfile` (de producción: build de Vite en una etapa, servido con `serve` en la segunda etapa — distinto al Dockerfile de desarrollo local, que usa `npm run dev`).
- **Variables de entorno**: `VITE_API_URL` (URL pública del backend + `/api`). Importante: esta variable se "hornea" en el momento del build, no se puede cambiar después sin redesplegar.

## Tareas manuales poco frecuentes

### Correr el seed de nuevo (crear usuarios de prueba)

En la consola del servicio `climarte-erp` (pestaña "Console" en Railway):

node dist/prisma/seed.js

### Ver logs en vivo

Servicio correspondiente → pestaña "Deployments" → click en el despliegue activo → "View logs".

## Diferencias entre el Dockerfile local y el de producción

El proyecto tiene **dos versiones** de cada Dockerfile, con objetivos distintos:

- **Local** (el que usa `docker-compose.yml` en la PC): prioriza desarrollo cómodo, con `npm run dev` y recarga en caliente.
- **Producción** (el que usa Railway): compila una sola vez y sirve el resultado ya construido, más liviano y estable.

Si en el futuro se necesita cambiar algo del arranque en producción, el archivo a tocar es el mismo `Dockerfile` de cada carpeta (`apps/api/Dockerfile`, `apps/web/Dockerfile`) — Railway y Docker Compose local leen el mismo archivo, así que un cambio ahí afecta a ambos entornos. Si algún día hace falta diferenciarlos del todo, se puede pasar a `Dockerfile.dev` / `Dockerfile.prod` separados.

## Pendiente

- Cambiar las contraseñas de los usuarios de prueba (`climarte2026`) ahora que el sistema es accesible desde internet.
- Limpiar datos de prueba de la base de producción.
- Configurar "Watch Paths" para que cada servicio redespliegue solo cuando cambia su propia carpeta.
