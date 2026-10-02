# Tasks: cleanup-obsolete-frontend-workflows

> Mapeadas al Diseño de Clases/Componentes del artefacto enriquecido (workflows de GitHub). Capa: `infrastructure` (config CI/CD; `Capas afectadas: deploy` del artefacto enriquecido; la nomenclatura `smart | dumb` no aplica a tareas de workflows).

## Mandatory Steps

Esta checklist es **obligatoria, no sugerida**. Aplica a toda tarea de implementación ejecutada vía `/apply`, tanto en el propio framework Specboot (dogfooding) como en cualquier proyecto consumidor.

### Pre-implementación

Antes de escribir la primera línea de la tarea actual:

- [x] La **rama activa** sigue la convención vigente del proyecto (ej.
  `feature/*`, `fix/*`); trabajar sobre ella, nunca directamente sobre la rama
  principal. *(Verificado: `feature/cleanup-obsolete-frontend-workflows`)*
- [x] Estado **git limpio**: sin cambios sin commitear (ni staged) antes de
  empezar; si hay trabajo en curso, resolverlo primero. *(Verificado en
  preflight: dirt limitado a artefactos del propio change —
  `openspec/changes/cleanup-obsolete-frontend-workflows/` y el artefacto
  enriquecido en `openspec/tickets/` — tolerado a nivel de change según
  `openspec/state/apply-preflight-cleanup-obsolete-frontend-workflows.json`)*

### Durante la implementación

- [x] **Test nuevo que falla antes de implementar (RED)**: escribir el test del
  escenario (`SC-NNN`) y verificar que falla antes de escribir código de
  producción. *(Verificado: `scripts/validate-workflows-cleanup.sh` falla con
  exit 1 mientras los workflows obsoletos existen — RED antes de la eliminación)*
- [x] Ejecutar los **tests unitarios del módulo** tocado mientras se itera
  (ciclo RED-GREEN-REFACTOR), no solo al final. *(Verificado: script de
  validación ejecutado en cada paso del ciclo — RED x2, GREEN; `pnpm test`
  13/13 PASS)*

### Post-implementación

Antes de dar la tarea por cerrada:

- [x] **Ejecutar `verify`**: la verificación del change corre y produce
  evidencia persistente (`openspec/state/verify-results.json`). *(Marcado
  defensivamente en archive 2026-10-02: evidencia persistida — status `PARTIAL`,
  ver `openspec/state/verify-results.json`)*
- [x] **Ejecutar `adversarial-review`**: la auditoría adversarial corre y
  produce veredicto persistente (`openspec/state/adversarial-result.json`).
  *(Marcado defensivamente en archive 2026-10-02: veredicto persistido — `SHIP`
  confidence 0.85, ver `openspec/state/adversarial-result.json`)*

> Ambos pasos post alimentan los gates duros de `/commit` (M-901): sin
> `PASS` + `SHIP` vigentes para el change activo, el commit bloquea.

## Task 1 — Test de verificación de limpieza de workflows (TDD RED)

**Prioridad**: Alta | **Capa**: infrastructure | **Estimación**: XS

**Diseño**: validación transversal de workflows (`.github/workflows/`), `.env.example` y `src/lib/api-client.ts` (SC-001, SC-002, SC-003, SC-004, SC-005)

- [x] 1.1 Crear `scripts/validate-workflows-cleanup.sh` con checks estáticos: (a) `.github/workflows/preview.yml`, `deploy.yml` y `cleanup.yml` ausentes, (b) `.github/workflows/ci.yml` presente, (c) `.env.example` con `PUBLIC_API_URL` y `PUBLIC_API_BASE_URL` y `src/lib/api-client.ts` con `PUBLIC_API_URL`, (d) sin referencias de deploy a Cloud Run en `.github/workflows/` (`gcloud run`, `run.app`, `us-central1-docker.pkg.dev`) *(Verificado RED: exit 1, 4 failures — 3 workflows presentes + 7 matches de Cloud Run en workflows; checks (b)/(c) en PASS)*

**Suggested Path**: `scripts/validate-workflows-cleanup.sh`
**Test Path**: `scripts/validate-workflows-cleanup.sh`

## Task 2 — Eliminar workflows obsoletos de Cloud Run (TDD GREEN)

**Prioridad**: Alta | **Capa**: infrastructure | **Estimación**: XS

**Diseño**: `.github/workflows/preview.yml` (eliminar), `.github/workflows/deploy.yml` (eliminar), `.github/workflows/cleanup.yml` (eliminar) (SC-001, SC-002, SC-003)

- [x] 2.1 Ejecutar `bash scripts/validate-workflows-cleanup.sh` y verificar que falla (RED: los workflows aún existen) *(Verificado: exit 1, 4 failures)*
- [x] 2.2 Eliminar `.github/workflows/preview.yml`, `.github/workflows/deploy.yml` y `.github/workflows/cleanup.yml` (`git rm`) *(Verificado: `git rm` ejecutado, estado `D` staged)*
- [x] 2.3 Re-ejecutar `bash scripts/validate-workflows-cleanup.sh` y verificar que pasa (GREEN) *(Verificado: exit 0, 8/8 checks PASS)*
- [x] 2.4 Ejecutar `pnpm test` (vitest) y verificar sin regresiones (e2e corre en CI vía `ci.yml` intacto) *(Verificado: 4 test files, 13/13 tests PASS, 2.22s)*

**Suggested Path**: `.github/workflows/preview.yml`, `.github/workflows/deploy.yml`, `.github/workflows/cleanup.yml`
**Test Path**: `scripts/validate-workflows-cleanup.sh`

## Task 3 — Verificación de preservación y restos (post-implementación)

**Prioridad**: Alta | **Capa**: infrastructure | **Estimación**: XS

**Diseño**: verificación de `ci.yml` intacto, config del backend preservada y restos de Cloud Run (SC-004, SC-005, SC-006, SC-007, SC-008)

- [x] 3.1 Verificar `git diff main -- .github/workflows/ci.yml` vacío (SC-004) *(Verificado: diff de 0 líneas — `ci.yml` intacto)*
- [x] 3.2 Confirmar checks (c) del script: `PUBLIC_API_URL`/`PUBLIC_API_BASE_URL` preservados en `.env.example` y `src/lib/api-client.ts` (SC-005) *(Verificado: 3/3 checks (c) en PASS, exit 0)*
- [x] 3.3 Búsqueda de referencias a Cloud Run (`run.app`, `us-central1`, `cloudrun`) en el repo: solo URLs/fallbacks de la API (`Contact.astro`, `Footer.astro`, `Unsubscribe.astro`) y comentarios de cold starts (SC-006) *(Verificado: solo fallbacks `api-agencia-201828783555.southamerica-west1.run.app` en los 3 componentes + placeholders de `.env.example` + comentarios `30s para tolerar cold starts` en `Footer.astro:198` y `Contact.astro:152`; 0 matches en `.github/`)*
- [ ] 3.4 Verificar en Coolify que los build args `PUBLIC_*` y `FIREBASE_SERVICE_ACCOUNT` estén configurados para el SSR (SC-007, SC-008 — check de infraestructura, fuera del repo)

**Suggested Path**: `.github/workflows/ci.yml` (solo lectura/verificación)
**Test Path**: `scripts/validate-workflows-cleanup.sh`
