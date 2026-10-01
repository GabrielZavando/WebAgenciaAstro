## ADDED Requirements

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
