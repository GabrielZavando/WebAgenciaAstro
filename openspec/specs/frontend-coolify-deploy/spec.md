# frontend-coolify-deploy Specification

## Purpose
Preparación del despliegue del frontend Astro SSR (Standalone) para Coolify: imagen Docker genérica (sin acoplarse a Cloud Run), puerto dinámico inyectado por la plataforma en runtime, seguridad del build context, sitemap con `PUBLIC_SITE_URL` y guardas de regression de secretos en git. La configuración one-time de Coolify (webhook, healthcheck, dominio temporal) es una tarea de infraestructura separada, documentada en `docs/deploy-standards.md`.
## Requirements
### Requirement: Imagen Docker genérica

La imagen Docker del frontend SHALL construirse sin acoplarse a Cloud Run: sin `ENV PORT=8080` ni `EXPOSE 8080`, con `ARG PUBLIC_SITE_URL` (+ `ENV` correspondiente) embebido en el bundle del build y `CMD` = `node ./dist/server/entry.mjs`. (Trazabilidad: SC-001, SC-002)

#### Scenario: Build de imagen genérica
- **WHEN** se ejecuta el build de la imagen con el Dockerfile actualizado y `PUBLIC_SITE_URL` como build-arg
- **THEN** la imagen se construye sin errores, `PUBLIC_SITE_URL` queda embebido en el bundle y el contenedor arranca con `node ./dist/server/entry.mjs`

### Requirement: Puerto dinámico de la plataforma

El contenedor SHALL escuchar en el puerto inyectado por la plataforma (`PORT`) en runtime, sin puerto hardcodeado en el Dockerfile; en local usa el default de `astro.config` (4321). (Trazabilidad: SC-002)

#### Scenario: Puerto dinámico de la plataforma
- **WHEN** se consulta el contenedor en el puerto asignado con `PORT` inyectado en runtime (p.ej. `PORT=3457`)
- **THEN** el servidor Astro responde HTTP 200 en ese puerto dinámico y el Dockerfile no fija `PORT=8080` ni `EXPOSE` fijo

### Requirement: Sin secretos en la imagen

El `.dockerignore` SHALL excluir explícitamente `.env`, `.env.*` y `*.local` (más archivos locales/repo) para que ningún secreto local quede embebido en la imagen final. (Trazabilidad: SC-003)

#### Scenario: Sin secretos en la imagen
- **WHEN** se construye la imagen con un archivo `.env` con secretos presente en el build context
- **THEN** `.dockerignore` excluye `.env`, `.env.*` y `*.local`, y ningún secreto queda embebido en la imagen final

### Requirement: Sitemap con URL del sitio configurada

El endpoint `/sitemap.xml` SHALL generar URLs usando `PUBLIC_SITE_URL` configurada como ARG/ENV de build, sin caer en `localhost` ni fallbacks incorrectos. (Trazabilidad: SC-006)

#### Scenario: Sitemap con URL correcta
- **WHEN** se accede a `/sitemap.xml` con `PUBLIC_SITE_URL` configurado como ARG/ENV de build
- **THEN** las URLs generadas usan la URL del sitio configurada (no `localhost` ni fallback incorrecto)

### Requirement: Guardas de regression para secretos en git

El script de validación SHALL verificar como guardas de regression que `.env` no esté trackeado en git (`git ls-files .env` vacío) y que `.gitignore` declare `.env` (con `.env.*` para variantes y `!.env.example` preservando el template), previniendo que variantes de secretos o re-adiciones versionen secretos en commits futuros. Estado verificado: `.env` no está trackeado y está en `.gitignore`. (Trazabilidad: SC-007, SC-003)

#### Scenario: .env no trackeado en git
- **WHEN** el script de validación corre los checks (d) y (e) sobre el repo
- **THEN** `.env` no aparece trackeado (`git ls-files .env` vacío) y `.gitignore` declara `.env` (con `!.env.example` preservado), detectando cualquier intento futuro de versionar secretos

### Requirement: Healthcheck dependency en la imagen de producción

La imagen de producción SHALL incluir `curl` — instalado en el stage de producción con `apk add --no-cache curl` antes de crear el usuario no-root — porque la plataforma (Coolify) ejecuta su healthcheck dentro del contenedor y la imagen base `node:22-alpine` no lo incluye; sin curl el healthcheck falla con `/bin/sh: curl: not found` (falla empírica observada en el primer despliegue a Coolify). (Post-archive fix — evidencia: script check (f) + healthcheck real de Coolify)

#### Scenario: Healthcheck de la plataforma con curl disponible
- **WHEN** Coolify ejecuta su healthcheck dentro del contenedor de producción
- **THEN** `curl` está disponible en la imagen (`apk add --no-cache curl` en el stage 2) y el healthcheck puede ejecutar su verificación de salud

### Requirement: Workflows de Cloud Run eliminados

El repositorio SHALL eliminar `.github/workflows/preview.yml`, `.github/workflows/deploy.yml` y `.github/workflows/cleanup.yml`; tras el cambio, ningún workflow de GitHub SHALL desplegar o limpiar servicios del frontend en Cloud Run y ningún merge a `main` SHALL disparar deploy del frontend a Cloud Run (solo el webhook de Coolify). (Trazabilidad: SC-001, SC-002, SC-003)

#### Scenario: Merge a main sin deploy a Cloud Run
- **WHEN** se mergea un PR a `main` tras el cambio
- **THEN** solo el webhook de Coolify dispara el despliegue del frontend; no existe ningún workflow que despliegue (`preview.yml`, `deploy.yml`) o limpie (`cleanup.yml`) servicios del frontend en Cloud Run

#### Scenario: Workflows ausentes en el árbol
- **WHEN** se inspecciona el árbol del repo tras el cambio
- **THEN** `.github/workflows/preview.yml`, `.github/workflows/deploy.yml` y `.github/workflows/cleanup.yml` no existen y ninguna config del repo los referencia

### Requirement: ci.yml intacto

`.github/workflows/ci.yml` SHALL permanecer sin modificaciones y sus validaciones (astro check, build, e2e) SHALL seguir disparándose en PRs a `main`. (Trazabilidad: SC-004)

#### Scenario: ci.yml sin modificaciones
- **WHEN** se compara `.github/workflows/ci.yml` contra `main` tras el cambio
- **THEN** `git diff` no muestra modificaciones y las validaciones del workflow siguen activas para PRs a `main`

### Requirement: Config del backend preservada

Las variables `PUBLIC_API_URL` y `PUBLIC_API_BASE_URL` SHALL persistir en `.env.example` y en sus usos en `src/` (incl. `src/lib/api-client.ts`); no SHALL eliminarse ninguna config de Google Cloud usada por el backend (secrets de Firebase incluidos). (Trazabilidad: SC-005)

#### Scenario: Variables de la API preservadas
- **WHEN** se completa el cambio
- **THEN** `PUBLIC_API_URL`/`PUBLIC_API_BASE_URL` persisten en `.env.example` y en `src/lib/api-client.ts`, y los secrets de Firebase permanecen configurados

### Requirement: Sin restos de Cloud Run fuera de las URLs de la API

Tras el cambio, una búsqueda de referencias a Cloud Run SHALL encontrar únicamente las URLs/fallbacks de la API (en `Contact.astro`, `Footer.astro`, `Unsubscribe.astro`) y comentarios asociados a cold starts del backend. (Trazabilidad: SC-006)

#### Scenario: Búsqueda de restos de Cloud Run
- **WHEN** se ejecuta una búsqueda de referencias a Cloud Run (`run.app`, `us-central1`, `cloudrun`) sobre el repo
- **THEN** solo aparecen URLs/fallbacks de la API y comentarios de cold starts del backend; ningún workflow referencia deploy del frontend a Cloud Run

### Requirement: Continuidad del despliegue en Coolify

El frontend desplegado en Coolify SHALL seguir llamando a la API del backend (Cloud Run) con respuestas 2xx sin errores CORS; el CORS del backend SHALL autorizar el dominio de Coolify (la corrección, si hiciera falta, se hace en la config del backend, fuera de este change). (Trazabilidad: SC-007, SC-008)

#### Scenario: Frontend en Coolify consume la API
- **WHEN** un usuario del frontend en Coolify envía el formulario de contacto o navega páginas que consumen la API
- **THEN** las llamadas van contra la API del backend en Cloud Run y responden 2xx sin errores CORS

