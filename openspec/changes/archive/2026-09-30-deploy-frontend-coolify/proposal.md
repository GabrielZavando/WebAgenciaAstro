# Proposal: deploy-frontend-coolify

**Ticket ID**: deploy-frontend-coolify
**Original title**: Especificar el despliegue del frontend Astro (SSR Standalone) en un VPS gestionado con Coolify mediante Docker
**Tag**: [deploy] (explícito, confirmado por el usuario)
**Branch**: feature/deploy-frontend-coolify
**Enriched source**: openspec/tickets/deploy-frontend-coolify-enriched.md

## Why

El `Dockerfile` actual está acoplado a Cloud Run (fija `ENV PORT=8080`, `EXPOSE 8080` y lleva comentarios de Cloud Run) y el `.dockerignore` no excluye `.env*`, por lo que secretos locales podrían copiarse al build context vía `COPY . .`. No existe config CI/CD en el repo. Se necesita una imagen Docker genérica compatible con Coolify (que inyecta el `PORT` dinámicamente), con `ARG PUBLIC_SITE_URL` para el sitemap, build directo en Coolify sin registro externo de imágenes, deploy automático por webhook nativo (GitHub App) al hacer push a `main`, y validación en dominio temporal (healthcheck contra `/` + SSL) antes del cutover DNS a `gabrielzavando.cl`, que queda fuera de alcance (ticket posterior).

## What Changes

### Incluido

- **Dockerfile** (infrastructure): eliminar `ENV PORT=8080` / `EXPOSE 8080` (residuos de Cloud Run); añadir `ARG PUBLIC_SITE_URL` (+ `ENV` correspondiente) junto a los `ARG PUBLIC_*` existentes; `CMD` sigue siendo `node ./dist/server/entry.mjs`.
- **.dockerignore** (infrastructure): excluir explícitamente `.env`, `.env.*`, `*.local` y directorios locales/repo (`.github`, `.opencode`, `.vscode`, `ai-specs`, `docs`, `openspec`, `coverage`, `playwright-report`, `test-results`).
- **Script de validación** (infrastructure): checks estáticos sobre Dockerfile/.dockerignore/git + build opcional que verifica el arranque con `PORT` dinámico y la ausencia de secretos en la imagen (TDD RED-GREEN).
- **Documentación**: `docs/deploy-standards.md` con el flujo real Coolify (reemplaza el placeholder) y `docs/project/stack.md` con la infraestructura real.

### Fuera de alcance (non-goals)

- **Configuración inicial de Coolify** (integración GitHub App/webhook, build args, healthcheck contra `/`, dominio temporal + SSL): tarea de infraestructura **one-time separada**, documentada en `docs/deploy-standards.md` — restructura §7: este change completa solo la preparación del código; el despliegue ocurre cuando Coolify detecta el push a `main` tras el merge.
- Cutover DNS final a `gabrielzavando.cl` (ticket posterior).
- Deploy del backend Api (su acceso vía `PUBLIC_API_BASE_URL` es prerrequisito, no parte de este ticket).
- SSG (`output: 'static'`), registro externo de imágenes (GHCR), cambios en `astro.config.mjs` (ya es genérico).

## Capabilities

### New Capabilities

- `frontend-coolify-deploy`: preparación del despliegue del frontend Astro SSR (Standalone) para Coolify — imagen Docker genérica (sin acoplarse a Cloud Run), puerto dinámico inyectado por la plataforma en runtime, seguridad del build context (.dockerignore), sitemap con `PUBLIC_SITE_URL` y guardas de regression de secretos en git.

### Modified Capabilities

- Ninguna (`openspec/specs/` no tiene capabilities existentes; este change introduce la primera).

## Impact

- **Código afectado**: `Dockerfile` (modificación), `.dockerignore` (modificación), `.gitignore` (hardening), `scripts/validate-docker-coolify.sh` (nuevo), `docs/deploy-standards.md` y `docs/project/stack.md` (documentación).
- **APIs**: sin cambios de contract; el frontend consume `PUBLIC_API_BASE_URL` del backend Api (prerrequisito de acceso, no cambio).
- **Dependencias/sistemas**: Coolify (plataforma de deploy, config one-time separada), GitHub App (integración webhook nativa), Let's Encrypt (SSL), Docker (build multi-stage con pnpm).
- **Base de datos**: sin cambios.
