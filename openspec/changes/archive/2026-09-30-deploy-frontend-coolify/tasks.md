# Tasks: deploy-frontend-coolify

> Mapeadas al Diseño de Clases/Componentes del artefacto enriquecido (Dockerfile, .dockerignore). Capa: `infrastructure` (trabajo de deploy/infra; nomenclatura `smart | dumb` no aplica a estas tareas). **Restucture (§7)**: Task 4 (config de Coolify) movida fuera de este change — es una tarea de infraestructura one-time separada, documentada en `docs/deploy-standards.md` (§ Configuración inicial).

## Mandatory Steps

### Pre-implementación

Antes de escribir la primera línea de la tarea actual:

- [x] La **rama activa** sigue la convención vigente del proyecto (ej.
  `feature/*`, `fix/*`); trabajar sobre ella, nunca directamente sobre la rama
  principal.
- [x] Estado **git limpio**: sin cambios sin commitear (ni staged) antes de
  empezar; si hay trabajo en curso, resolverlo primero.

## Durante la implementación

- [x] **Test nuevo que falla antes de implementar (RED)**: escribir el test del
  escenario (`SC-NNN`) y verificar que falla antes de escribir código de
  producción.
- [x] Ejecutar los **tests unitarios del módulo** tocado mientras se itera
  (ciclo RED-GREEN-REFACTOR), no solo al final.

## Post-implementación

Antes de dar la tarea por cerrada:

- [x] **Ejecutar `verify`**: la verificación del change corre y produce
  evidencia persistente (`openspec/state/verify-results.json`).
- [x] **Ejecutar `adversarial-review`**: la auditoría adversarial corre y
  produce veredicto persistente (`openspec/state/adversarial-result.json`).

> Ambos pasos post alimentan los gates duros de `/commit` (M-901): sin
> `PASS` + `SHIP` vigentes para el change activo, el commit bloquea.

## Task 1 — Test de validación Docker/Coolify (TDD RED)

**Priority**: high | **Layer**: infrastructure | **Estimate**: XS
**Diseño**: validación transversal de Dockerfile, .dockerignore y Coolify app config

- [x] 1.1 Crear `scripts/validate-docker-coolify.sh` con checks estáticos: (a) Dockerfile sin `ENV PORT=8080` ni `EXPOSE 8080`, (b) Dockerfile con `ARG PUBLIC_SITE_URL`, (c) `.dockerignore` con `.env`, `.env.*` y `*.local`; flag opcional `--build` para `docker build` + arranque del contenedor con `PORT` dinámico
- [x] 1.2 Ejecutar el script contra el estado actual y verificar **RED** (falla: `ENV PORT=8080`/`EXPOSE 8080` presentes y `.dockerignore` sin `.env*`)

**Suggested Path**: `scripts/validate-docker-coolify.sh`
**Test Path**: `scripts/validate-docker-coolify.sh`

## Task 2 — Dockerfile genérico Coolify (TDD GREEN)

**Priority**: high | **Layer**: infrastructure | **Estimate**: S
**Diseño**: Dockerfile (multi-stage builder/runner)

- [x] 2.1 Eliminar `ENV PORT=8080` y `EXPOSE 8080` y los comentarios de Cloud Run del stage de producción
- [x] 2.2 Añadir `ARG PUBLIC_SITE_URL` + `ENV PUBLIC_SITE_URL` al stage builder, junto a los `ARG PUBLIC_*` existentes
- [x] 2.3 Mantener `CMD ["node", "./dist/server/entry.mjs"]` y el stage de producción sin puerto fijo
- [x] 2.4 Ejecutar el script de validación y verificar **GREEN**
- [x] 2.5 `docker build` local con `PUBLIC_SITE_URL` + arranque del contenedor con `PORT` dinámico (SC-001, SC-002) y verificación de `/sitemap.xml` con URL correcta (SC-006)

**Suggested Path**: `Dockerfile`
**Test Path**: `scripts/validate-docker-coolify.sh`

## Task 3 — .dockerignore de seguridad

**Priority**: high | **Layer**: infrastructure | **Estimate**: XS
**Diseño**: .dockerignore

- [x] 3.1 Añadir explícitamente `.env`, `.env.*`, `*.local` y directorios locales/repo (`.github`, `.opencode`, `ai-specs`, `docs`, `openspec`, `coverage`, `playwright-report`, `test-results`, `.vscode`)
- [x] 3.2 Verificar con `docker build` + inspección que ningún secreto queda embebido en la imagen (SC-003)

**Suggested Path**: `.dockerignore`
**Test Path**: `scripts/validate-docker-coolify.sh`

## Task 5 — Documentación del flujo de deploy

**Priority**: medium | **Layer**: infrastructure | **Estimate**: XS
**Diseño**: documentación (DoD del change)

- [x] 5.1 Completar `docs/deploy-standards.md` con el flujo real Coolify: entornos, build, webhook, healthcheck, SSL, rollback (versión anterior activa) — reemplaza el placeholder
- [x] 5.2 Completar `docs/project/stack.md` con la infraestructura real: Docker, Coolify, pnpm 10, Astro 5 (SSR Standalone)

**Suggested Path**: `docs/deploy-standards.md`
**Test Path**: no aplica

## Task 6 — Guardas de regression de secretos en git (corrección del hallazgo)

**Priority**: medium | **Layer**: infrastructure | **Estimate**: XS
**Diseño**: higiene de secretos en el repo (complemento de .dockerignore / SC-003, REQ-008)
**Corrección**: el hallazgo inicial (".env trackeado") fue una lectura errónea del output de `git ls-files .env .env.example && git check-ignore .env`: `.env` NUNCA estuvo trackeado (está en `.gitignore` y solo `.env.example` está trackeado). No se requiere `git rm --cached` ni rotación de secretos; los checks (d)/(e) quedan como guardas de regression permanente.

- [x] 6.1 Extender `scripts/validate-docker-coolify.sh` con checks estáticos de regression: (d) `.env` no trackeado en git (`git ls-files .env` vacío), (e) `.gitignore` con línea `^\.env$` — RED no aplicable (no había defecto que corregir: los checks nacen GREEN con el estado verificado)
- [x] 6.2 Robustecer `.gitignore` con `.env.*` + `!.env.example` (`.env` ya presente; el template permanece trackeado y se previenen variantes futuras como `.env.local`/`.env.production`) → verificado por contenido del archivo

**Suggested Path**: `.gitignore`
**Test Path**: `scripts/validate-docker-coolify.sh`
