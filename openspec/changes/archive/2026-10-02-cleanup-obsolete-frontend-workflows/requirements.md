# Requirements: cleanup-obsolete-frontend-workflows

> Cada requisito es trazable a al menos un escenario de `scenarios.md` (`SC-{NNN}`).

### REQ-001: Eliminación del workflow de preview

El repositorio SHALL eliminar `.github/workflows/preview.yml` y no SHALL quedar ninguna referencia a ese archivo en la config del repo. (Trazabilidad: SC-001)

### REQ-002: Eliminación del workflow de deploy de producción

El repositorio SHALL eliminar `.github/workflows/deploy.yml`; tras el cambio, ningún merge a `main` SHALL disparar deploy del frontend a Cloud Run (solo el webhook de Coolify). (Trazabilidad: SC-002)

### REQ-003: Eliminación del workflow de cleanup de previews

El repositorio SHALL eliminar `.github/workflows/cleanup.yml`; no SHALL quedar ningún workflow que gestione servicios preview `landing-pr-*` en Cloud Run. (Trazabilidad: SC-003)

### REQ-004: ci.yml intacto

`.github/workflows/ci.yml` SHALL permanecer sin modificaciones (`git diff` vacío para ese path) y sus validaciones (astro check, build, e2e) SHALL seguir disparándose en PRs a `main`. (Trazabilidad: SC-004)

### REQ-005: Preservación de la config del backend

Las variables `PUBLIC_API_URL` y `PUBLIC_API_BASE_URL` SHALL persistir en `.env.example` y en sus usos en `src/` (incl. `src/lib/api-client.ts`); no SHALL eliminarse ninguna config de Google Cloud usada por el backend (secrets de Firebase incluidos). (Trazabilidad: SC-005)

### REQ-006: Sin restos de Cloud Run fuera de las URLs de la API

Tras el cambio, una búsqueda de referencias a Cloud Run (`run.app`, `us-central1`, `cloudrun`) SHALL encontrar únicamente las URLs/fallbacks de la API (en `Contact.astro`, `Footer.astro`, `Unsubscribe.astro`) y comentarios asociados a cold starts del backend; no SHALL existir ningún workflow que despliegue el frontend a Cloud Run. (Trazabilidad: SC-006)

### REQ-007: Continuidad del frontend en Coolify

El frontend desplegado en Coolify SHALL seguir llamando a la API del backend (Cloud Run) y las respuestas SHALL ser 2xx sin errores CORS. (Trazabilidad: SC-007)

### REQ-008: CORS del backend autoriza el dominio de Coolify

El CORS del backend NestJS SHALL autorizar el dominio de Coolify; si el dominio no está autorizado, la corrección SHALL hacerse en la config del backend (repo/API fuera de este change). (Trazabilidad: SC-008)
