# Proposal: cleanup-obsolete-frontend-workflows

**Ticket ID**: cleanup-obsolete-frontend-workflows
**Original title**: cleanup-obsolete-frontend-workflows — Eliminar únicamente el workflow de despliegue del frontend a Cloud Run, preservando toda configuración relacionada con el backend API
**Tag**: [deploy] (inferido del artefacto enriquecido `Capas afectadas: deploy` + confirmado por el usuario)
**Branch**: feature/cleanup-obsolete-frontend-workflows
**Enriched source**: openspec/tickets/cleanup-obsolete-frontend-workflows-enriched.md

## Why

El frontend migró a Coolify (change `deploy-frontend-coolify`, archivado 2026-09-30), pero el repo conserva tres workflows de GitHub que aún gestionan despliegues del frontend en Cloud Run: `preview.yml` (deploy de preview por PR), `deploy.yml` (deploy de producción al merge) y `cleanup.yml` (borrado de servicios preview `landing-pr-*`). El resultado es un doble deploy en cada merge a `main` — Cloud Run vía `deploy.yml` + Coolify vía webhook nativo de GitHub App — además del costo de mantener configuración muerta. El backend API (NestJS) sigue en Cloud Run y no se toca: `PUBLIC_API_URL`/`PUBLIC_API_BASE_URL` y los secrets de Firebase permanecen intactos.

## What Changes

### Incluido

- **.github/workflows/preview.yml** (eliminar): deploy de preview del frontend a Cloud Run por PR (`landing-pr-{n}`) — obsoleto tras migración a Coolify.
- **.github/workflows/deploy.yml** (eliminar): deploy de producción del frontend a Cloud Run al merge — obsoleto y en conflicto con el webhook de Coolify (doble deploy). Decisión confirmada por el usuario.
- **.github/workflows/cleanup.yml** (eliminar): borrado de servicios preview `landing-pr-*` de Cloud Run al cerrar PR — huérfano sin `preview.yml`. La limpieza manual de servicios antiguos en GCP se hará fuera del repo (decisión confirmada).
- **Script de verificación** (infrastructure): `scripts/validate-workflows-cleanup.sh` con checks estáticos — ausencia de los workflows eliminados, presencia intacta de `ci.yml`, preservación de `PUBLIC_API_URL`/`PUBLIC_API_BASE_URL` y ausencia de referencias de deploy a Cloud Run en workflows (TDD RED-GREEN).

### Fuera de alcance (non-goals)

- **.github/workflows/ci.yml**: intacto (validaciones astro check/build/e2e Playwright).
- Variables `PUBLIC_API_URL`/`PUBLIC_API_BASE_URL` y secrets de Firebase (apuntan al backend en Cloud Run) — preservados.
- Fallbacks hardcodeados de la API (`southamerica-west1`) — preservados tal cual (decisión confirmada); alineación de región/servicio = fix posterior si se confirma necesario.
- `.github/workflows/release-please.yml` + `release.yml` — releases de GitHub; release-please usa auth GCP para `OPENAI_API_KEY` de release notes, no es deploy del frontend.
- Limpieza manual de servicios preview antiguos en GCP (`landing-pr-*`) — fuera del repo.
- Config CORS del backend NestJS (autorizar dominio de Coolify) — se resuelve en el repo/API del backend.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `frontend-coolify-deploy`: el despliegue del frontend SHALL ser exclusivo de Coolify — ningún workflow de GitHub despliega o limpia servicios del frontend en Cloud Run; la config del backend (vars `PUBLIC_*`, secrets de Firebase) SHALL preservarse.

## Impact

- **Código afectado**: `.github/workflows/preview.yml` (eliminación), `.github/workflows/deploy.yml` (eliminación), `.github/workflows/cleanup.yml` (eliminación), `scripts/validate-workflows-cleanup.sh` (nuevo).
- **APIs**: sin cambios de contract; el frontend sigue consumiendo la API en Cloud Run vía `PUBLIC_API_URL`/`PUBLIC_API_BASE_URL` (prerrequisito de acceso, no cambio).
- **Dependencias/sistemas**: Coolify (plataforma de deploy exclusiva tras el cambio), GitHub Actions (`ci.yml` y workflows de release permanecen), Google Cloud Run (solo backend API).
- **Base de datos**: sin cambios.
