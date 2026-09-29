## User Story enriched: deploy-frontend-coolify

**As a** Gabriel Zavando (dev / owner del sitio)
**I want** desplegar el frontend Astro 5 (SSR Standalone) en un VPS con Coolify mediante Docker, con deploy automático por webhook nativo de Coolify (GitHub App) al hacer push a `main`
**So that** el sitio quede publicado en infraestructura propia gestionada por Coolify, con SSL y healthcheck validados, sin dependencia de Cloud Run

### Context

El `Dockerfile` actual (raíz del repo, build de dos etapas con `pnpm`) está acoplado a Cloud Run: fija `ENV PORT=8080`, `EXPOSE 8080` y lleva comentarios de Cloud Run. El `.dockerignore` no excluye `.env*`, por lo que secretos locales podrían entrar al build context vía `COPY . .`. No existe config CI/CD en el repo (sin `.github/`).

El objetivo es una imagen Docker **genérica** compatible con Coolify (que inyecta el `PORT` dinámicamente), con build directo en Coolify (sin registro externo de imágenes), y validación en dominio temporal (healthcheck + SSL) antes del cutover DNS.

**Fuera de alcance (non-goals):**
- Cutover DNS final a `gabrielzavando.cl` — se manejará como un ticket posterior.
- Deploy del backend Api (debe estar accesible para `PUBLIC_API_BASE_URL`, pero su despliegue no es parte de este ticket).

### Diseño de Clases/Componentes

- **Dockerfile (multi-stage builder/runner)**: responsabilidad única = "producir una imagen Docker genérica del frontend Astro SSR que compila con build-args públicos y ejecuta el servidor standalone escuchando en el PORT inyectado por la plataforma"
  - Cambios concretos: eliminar `ENV PORT=8080` y `EXPOSE 8080` (residuos de Cloud Run); añadir `ARG PUBLIC_SITE_URL` (+ `ENV` correspondiente) junto a los `ARG PUBLIC_*` ya existentes para que Vite lo embeba correctamente en el build del sitemap
  - Depende de: `pnpm-lock.yaml`, `astro.config.mjs` (lee `process.env.PORT`), NO de valores Cloud Run hardcodeados
  - Capa: infrastructure
- **.dockerignore**: responsabilidad única = "reducir el build context excluyendo secretos (`.env*`) y archivos locales/de repo que no pertenecen a la imagen"
  - Cambios concretos: añadir explícitamente `.env`, `.env.*` y `*.local` para evitar que cualquier secreto local se copie en el contexto de build (más directorios locales del repo: `.github`, `.opencode`, `ai-specs`, `docs`, `openspec`, `coverage`, `playwright-report`, `test-results`, `.vscode`)
  - Capa: infrastructure
- **Coolify app config (webhook + healthcheck + dominio temporal)**: responsabilidad única = "orquestar el build desde el repo, el healthcheck HTTP contra `/`, el SSL del dominio temporal y el trigger de deploy por webhook en push a `main`"
  - Depende de: Dockerfile (build), integración nativa de Coolify (GitHub App), NO de un registro externo de imágenes
  - Capa: infrastructure

**Capas afectadas:** deploy, frontend

### Acceptance Criteria

### SC-001: Build de imagen genérica
- Given el repo con el Dockerfile actualizado y `PUBLIC_SITE_URL` como build-arg
- When se ejecuta el build de la imagen (local o en Coolify)
- Then la imagen se construye sin errores, `PUBLIC_SITE_URL` queda embebido en el bundle y el contenedor arranca con `node ./dist/server/entry.mjs`

### SC-002: Puerto dinámico de la plataforma
- Given el contenedor corriendo en Coolify con `PORT` inyectado (p.ej. `PORT=3000`)
- When Coolify consulta el contenedor en el puerto asignado
- Then el servidor Astro responde HTTP 200 en ese puerto dinámico (el Dockerfile no fija `PORT=8080` ni `EXPOSE` fijo)

### SC-003: Sin secretos en la imagen
- Given un archivo `.env` con secretos presente en el build context
- When se construye la imagen
- Then `.dockerignore` excluye `.env`, `.env.*` y `*.local`, y ningún secreto queda embebido en la imagen final

### SC-004: Deploy por webhook en push a main
- Given Coolify conectado al repo vía GitHub App con el webhook configurado
- When se hace push a `main`
- Then Coolify dispara el build/deploy automáticamente y la nueva versión queda servida (build directo en Coolify, sin registro externo)

### SC-005: Validación con dominio temporal + SSL
- Given el despliegue inicial en Coolify con dominio temporal/por defecto
- When se accede por HTTPS al dominio temporal
- Then el healthcheck de Coolify (contra `/`) está en verde, el certificado SSL es válido y el sitio responde correctamente antes del cutover DNS (fuera de alcance de este ticket)

### SC-006: Sitemap con URL correcta
- Given `PUBLIC_SITE_URL` configurado como ARG/ENV de build
- When se accede a `/sitemap.xml`
- Then las URLs generadas usan la URL del sitio configurada (no `localhost` ni fallback incorrecto)

### Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| `PUBLIC_SITE_URL` no definido en build | El sitemap cae al fallback actual (origin del request / `gabrielzavando.cl`); el build no debe fallar por ello |
| `PORT` no inyectado (docker run local) | El servidor usa el default de `astro.config` (4321); el flujo local sigue funcional |
| Healthcheck falla (build OK pero app no responde) | Coolify marca el deploy como fallido y mantiene la versión anterior activa (rollback implícito) |
| Push a rama distinta de `main` | No dispara deploy; solo `main` despliega |
| Corepack/pnpm sin `packageManager` field | El build usa pnpm según lockfile; opcionalmente fijar `"packageManager": "pnpm@10.x"` para reproducibilidad |

### Estimación
Complejidad: S
Justificación: cambios en 2 archivos + configuración de plataforma; la validación (healthcheck/SSL) es manual pero puntual. El cutover DNS queda fuera de alcance.

### Riesgo
Nivel: Medio
Motivo: primer despliegue en plataforma nueva; mitigado por validación en dominio temporal y rollback implícito de Coolify (versión anterior activa hasta healthcheck verde).

### Dependencias
Tickets relacionados: ninguna registrada en `openspec/tickets/`. El backend Api debe estar accesible para `PUBLIC_API_BASE_URL` (su deploy se manejará como ticket posterior, fuera de alcance).

### Alternativas descartadas
- Alternativa: SSG (`output: 'static'`)
  Motivo del descarte: requiere middleware de auth y rutas dinámicas (sitemap dinámico, rutas de blog) → SSR Standalone.
- Alternativa: registro externo de imágenes (GHCR) + pull en Coolify
  Motivo del descarte: build directo en Coolify simplifica el pipeline y evita gestionar credenciales de registry.
- Alternativa: mantener Cloud Run
  Motivo del descarte: el objetivo del ticket es migrar a VPS propio gestionado con Coolify.
- Alternativa: cutover directo a `gabrielzavando.cl` sin validación
  Motivo del descarte: se valida primero con dominio temporal (healthcheck + SSL) antes del cutover; el cutover es un ticket posterior.
- Alternativa: GitHub Actions llamando a la deploy webhook URL
  Motivo del descarte: se usará la integración nativa de Coolify (GitHub App), que auto-configura el webhook sin gestionar secretos extra.

### Technical Considerations

- **Dockerfile**: eliminar `ENV PORT=8080` / `EXPOSE 8080` y los comentarios de Cloud Run; el stage de producción no fija puerto; `CMD` sigue siendo `node ./dist/server/entry.mjs` (lee `process.env.PORT`).
- **Dockerfile**: añadir `ARG PUBLIC_SITE_URL` (+ `ENV` correspondiente) al stage builder, junto a los `ARG PUBLIC_*` existentes — Vite embebe `import.meta.env.PUBLIC_SITE_URL` en el bundle server al build (lo consume `src/pages/sitemap.xml.ts`).
- **.dockerignore**: añadir explícitamente `.env`, `.env.*`, `*.local` y directorios locales/repo (`.github`, `.opencode`, `ai-specs`, `docs`, `openspec`, `coverage`, `playwright-report`, `test-results`, `.vscode`).
- **astro.config.mjs**: ya es genérico (`port: parseInt(process.env.PORT || '4321')`, `host: '0.0.0.0'`) — sin cambios esperados.
- **Webhook**: integración nativa de Coolify (GitHub App); deploy automático al hacer push a `main`; build directo en Coolify.
- **Healthcheck**: contra `/` (root); no se añade endpoint de health propio del frontend (`/health` es del backend Api).
- **Base de datos**: sin cambios. **API contract**: sin cambios.
- **Terceros**: Coolify + Let's Encrypt (SSL del dominio temporal; el certificado del dominio final llega con el cutover, ticket posterior).

### Definition of Done

- [ ] `docker build` local exitoso con `PUBLIC_SITE_URL` y sin secretos en la imagen (verificado)
- [ ] Contenedor escucha en el PORT inyectado por la plataforma (validado en Coolify)
- [ ] Deploy por webhook nativo de Coolify en push a `main` funcionando
- [ ] Healthcheck (contra `/`) verde + SSL válido en dominio temporal
- [ ] `/sitemap.xml` con URLs correctas
- [ ] Documentación actualizada (`docs/deploy-standards.md` con el flujo real Coolify)
- [ ] OpenSpec artifacts actualizados

### Questions for Clarification

1. Resuelto — Webhook: integración nativa de Coolify (GitHub App), auto-disparo en push a `main`.
2. Resuelto — Healthcheck: contra `/` (root); no se añade endpoint de health propio.
3. Resuelto — Cutover DNS a `gabrielzavando.cl`: fuera de alcance de este ticket (se manejará como ticket posterior).
