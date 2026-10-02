## ADDED Requirements

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
