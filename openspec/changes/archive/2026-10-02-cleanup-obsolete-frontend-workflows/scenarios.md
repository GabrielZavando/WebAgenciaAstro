# Scenarios: cleanup-obsolete-frontend-workflows

> Mapeados 1:1 desde el artefacto enriquecido `openspec/tickets/cleanup-obsolete-frontend-workflows-enriched.md` (IDs `SC-{NNN}` preservados). Contexto: change `deploy-frontend-coolify` (archivado 2026-09-30) y `docs/deploy-standards.md`.

### SC-001: Workflow de preview eliminado
- Given el repositorio con el branch de trabajo limpio
- When se elimina `.github/workflows/preview.yml`
- Then el archivo no existe en el árbol y ningún otro archivo de config del repo lo referencia (búsqueda sin resultados)

### SC-002: Workflow de deploy de producción a Cloud Run eliminado
- Given el repositorio con el branch de trabajo limpio
- When se elimina `.github/workflows/deploy.yml`
- Then el archivo no existe en el árbol y ningún merge a `main` dispara ya deploy a Cloud Run (solo el webhook de Coolify)

### SC-003: Workflow de cleanup de previews eliminado
- Given el repositorio con el branch de trabajo limpio
- When se elimina `.github/workflows/cleanup.yml`
- Then el archivo no existe en el árbol y no queda ningún workflow que gestione servicios preview `landing-pr-*` en Cloud Run

### SC-004: ci.yml intacto
- Given `.github/workflows/ci.yml` existente en el estado previo
- When se completa el cambio
- Then `ci.yml` no presenta modificaciones (`git diff` vacío para ese path) y sus validaciones (astro check, build, e2e) siguen disparándose en PRs a `main`

### SC-005: Config del backend preservada
- Given el estado previo con `PUBLIC_API_URL`, `PUBLIC_API_BASE_URL` y secrets de Firebase
- When se completa el cambio
- Then las variables persisten en `.env.example` y en sus usos en `src/` (incl. `src/lib/api-client.ts`), y no se elimina ninguna config de Google Cloud usada por el backend

### SC-006: Sin restos de Cloud Run fuera de las URLs de la API
- Given el código del frontend y la carpeta `.github/`
- When se ejecuta una búsqueda de referencias a Cloud Run (`run.app`, `us-central1`, `cloudrun`)
- Then solo quedan las URLs/fallbacks de la API (en `Contact.astro`, `Footer.astro`, `Unsubscribe.astro`) y comentarios asociados a cold starts del backend; no queda ningún workflow que despliegue el frontend a Cloud Run

### SC-007: Frontend en Coolify sigue llamando a la API (runtime)
- Given el frontend desplegado en Coolify con su dominio
- When un usuario envía el formulario de contacto o navega páginas que consumen la API
- Then las llamadas van contra la API del backend (Cloud Run) y responden 2xx sin errores CORS

### SC-008: CORS del backend autoriza el dominio de Coolify
- Given el backend NestJS en Cloud Run con CORS configurado
- When el frontend en el dominio de Coolify hace una request cross-origin
- Then la respuesta incluye los headers CORS del dominio autorizado; si el dominio no está autorizado, la corrección se hace en la config del backend (repo/API fuera de este change)

### Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| PR abierto en el momento de eliminar `preview.yml` | El workflow ya no se dispara; previews existentes (`landing-pr-*`) en Cloud Run quedan sin cleanup automático → borrado manual one-time en GCP, fuera del repo (decisión confirmada) |
| `release-please.yml` usa auth GCP + Secret Manager | Lee `OPENAI_API_KEY` para release notes — no es deploy del frontend, no se toca |
| Fallbacks hardcodeados apuntan a `southamerica-west1` | Se preservan tal cual (decisión confirmada): las URLs de la API no se modifican en este change; alineación de región/servicio = fix posterior si se confirma necesario |
| `PUBLIC_API_URL` en runtime | Debe seguir funcionando: `src/lib/api-client.ts` y páginas la resuelven vía `import.meta.env` — sin cambios en este change |
| `FIREBASE_SERVICE_ACCOUNT` en la imagen | Los workflows eliminados la inyectaban vía `--set-secrets`; en Coolify debe llegar como build arg/env (one-time config ya documentada) — verificación incluida |
| Doble deploy en cada merge | Resuelto al eliminar `deploy.yml`: solo Coolify despliega vía webhook — principal beneficio operativo del change |
