# Scenarios: deploy-frontend-coolify

> Mapeados 1:1 desde el artefacto enriquecido `openspec/tickets/deploy-frontend-coolify-enriched.md` (IDs `SC-{NNN}` preservados). SC-007 añadido por hallazgo de seguridad del `/apply`. **Restucture (§7)**: SC-004 (deploy por webhook) y SC-005 (validación con dominio temporal + SSL) quedan **fuera del alcance** de este change — son comportamiento de la configuración one-time de Coolify (tarea de infraestructura separada, documentada en `docs/deploy-standards.md`).

### SC-001: Build de imagen genérica
- Given el repo con el Dockerfile actualizado y `PUBLIC_SITE_URL` como build-arg
- When se ejecuta el build de la imagen (local o en Coolify)
- Then la imagen se construye sin errores, `PUBLIC_SITE_URL` queda embebido en el bundle y el contenedor arranca con `node ./dist/server/entry.mjs`

### SC-002: Puerto dinámico de la plataforma
- Given el contenedor con `PORT` inyectado en runtime (p.ej. `PORT=3457`)
- When se consulta el contenedor en el puerto asignado
- Then el servidor Astro responde HTTP 200 en ese puerto dinámico (el Dockerfile no fija `PORT=8080` ni `EXPOSE` fijo)

### SC-003: Sin secretos en la imagen
- Given un archivo `.env` con secretos presente en el build context
- When se construye la imagen
- Then `.dockerignore` excluye `.env`, `.env.*` y `*.local`, y ningún secreto queda embebido en la imagen final

### SC-006: Sitemap con URL correcta
- Given `PUBLIC_SITE_URL` configurado como ARG/ENV de build
- When se accede a `/sitemap.xml`
- Then las URLs generadas usan la URL del sitio configurada (no `localhost` ni fallback incorrecto)

### SC-007: Guardas de regression — .env no trackeado en git
- Given el repo con `.env` gitignored y `.env.example` como único archivo de entorno trackeado (estado verificado)
- When el script de validación corre los checks (d) y (e) sobre el repo
- Then `.env` no aparece trackeado (`git ls-files .env` vacío) y `.gitignore` declara `.env` (con `!.env.example` preservado), detectando cualquier intento futuro de versionar secretos antes de un push

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| `PUBLIC_SITE_URL` no definido en build | El sitemap cae al fallback actual (origin del request / `gabrielzavando.cl`); el build no falla por ello |
| `PORT` no inyectado (docker run local) | El servidor usa el default de `astro.config` (4321); el flujo local sigue funcional |
| Healthcheck falla (build OK pero app no responde) | Coolify marca el deploy como fallido y mantiene la versión anterior activa (rollback implícito) — comportamiento de plataforma, fuera del alcance de este change |
| Push a rama distinta de `main` | No dispara deploy; solo `main` despliega — configuración one-time de Coolify |
| Corepack/pnpm sin `packageManager` field | El build usa pnpm según lockfile; drift a pnpm 12 documentado como ticket de mantenimiento |
| Secretos ya expuestos en el historial de git | No aplica: `.env` nunca estuvo trackeado (verificado); `.gitignore` + guardas previenen re-adiciones |
