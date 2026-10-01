# Deploy Standards

> Flujo de despliegue del frontend Astro (SSR Standalone) — establecido en el change `deploy-frontend-coolify`.

## Entornos

- **Validación** (dominio temporal de Coolify): primer despliegue para validar build, healthcheck y SSL antes del cutover.
- **Production** (`gabrielzavando.cl`): dominio final tras el cutover DNS (ticket posterior).
- Versionado semántico (SemVer).

## Plataforma: Coolify (VPS)

> **Configuración inicial (one-time infra task)**: la configuración de Coolify —
> integración GitHub App (webhook), build args `PUBLIC_*`, healthcheck, dominio
> temporal y SSL — es una tarea de infraestructura **separada que se ejecuta una
> sola vez**, fuera del ciclo de changes de código. Una vez configurada, cada
> push a `main` despliega automáticamente.

### Build

- **Build directo desde el repo** (sin registro externo de imágenes): Coolify clona el repo y construye la imagen con el `Dockerfile` de la raíz (multi-stage: builder con pnpm + runner ligero con `node ./dist/server/entry.mjs`).
- El contenedor escucha en el **puerto dinámico** que Coolify inyecta como variable de entorno `PORT` en runtime (`astro.config.mjs` lee `process.env.PORT`); el Dockerfile no fija puerto ni `EXPOSE`.

### Webhook (deploy automático)

- **Integración nativa de Coolify con GitHub App**: auto-configura el webhook; cualquier push a `main` dispara el build/deploy.
- Pushes a otras ramas **no** despliegan (solo `main`).

### Healthcheck

- **Contra `/` (root)**: no existe endpoint de health propio del frontend (`/health` es del backend Api).
- Si el build es correcto pero el healthcheck falla, Coolify mantiene la versión anterior activa y marca el deploy como fallido (rollback implícito).

### Dominio y SSL

- Despliegue inicial con **dominio temporal/por defecto de Coolify** para validar healthcheck y SSL (Let's Encrypt) antes del cutover.
- **Cutover DNS final a `gabrielzavando.cl`**: ticket posterior (fuera de alcance del change `deploy-frontend-coolify`).

### Variables de entorno / build-args (ARG PUBLIC_*)

Astro/Vite embebe las variables `PUBLIC_*` en el bundle en build-time: deben configurarse como build args en Coolify (llegan al Dockerfile vía `ARG` + `ENV` del stage builder):

- `PUBLIC_SITE_URL` — URL del sitio (la consume `/sitemap.xml`)
- `PUBLIC_API_URL`
- `PUBLIC_API_BASE_URL`
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_TURNSTILE_SITE_KEY`
- `PUBLIC_GTM_ID`

### Validación del build (script)

- `bash scripts/validate-docker-coolify.sh` — checks estáticos: Dockerfile sin puerto Cloud Run (`ENV PORT=8080`/`EXPOSE 8080`), `ARG PUBLIC_SITE_URL`, `.dockerignore` sin secretos (`.env`, `.env.*`, `*.local`), `.env` no trackeado en git, `.gitignore` con `.env`.
- `bash scripts/validate-docker-coolify.sh --build` — además: `docker build` con `PUBLIC_SITE_URL`, arranque del contenedor con `PORT` dinámico, `/sitemap.xml`, y verificación empírica de que ni el builder stage ni la imagen final contienen `.env*`.

## Rollback

- **Plan de rollback**: Coolify mantiene la versión anterior activa hasta que el healthcheck de la nueva versión esté en verde; si falla, el deploy se marca como fallido y la versión anterior sigue sirviendo.
- Revertir manualmente: re-desplegar el commit anterior desde Coolify (Redeploy / rollback a deploy previo).

## Notas técnicas / mantenimiento pendiente

- **pnpm version drift**: el `Dockerfile` usa Corepack **sin campo `packageManager` fijo** en `package.json`, por lo que corepack descarga su default (pnpm 12.8.1 en el build validado) en lugar de pnpm 10; además, pnpm 12 ignora la clave `pnpm.allowBuilds` del `package.json`. El build funciona (lockfile frozen respetado), pero es un **ticket pendiente de mantenimiento**: fijar `"packageManager": "pnpm@10.x"` y migrar `allowBuilds` a su nuevo home (`pnpm-workspace.yaml`).
