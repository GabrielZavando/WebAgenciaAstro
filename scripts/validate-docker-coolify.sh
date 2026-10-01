#!/usr/bin/env bash
# ============================================================
# validate-docker-coolify.sh
# Static + optional build validation for the Coolify deployment
# of the Astro SSR frontend (change: deploy-frontend-coolify).
#
# Static checks (always run):
#   (a) Dockerfile must NOT hardcode Cloud Run port residues
#       (ENV PORT=8080 / EXPOSE 8080)               -> SC-002
#   (b) Dockerfile must declare ARG PUBLIC_SITE_URL    -> SC-001/SC-006
#   (c) .dockerignore must exclude .env, .env.* and *.local -> SC-003
#   (d) .env must NOT be tracked in git                -> SC-007
#   (e) .gitignore must declare .env (keeping !.env.example) -> SC-007
#   (f) Dockerfile must install curl for the platform healthcheck
#       (post-archive fix: Coolify runs its healthcheck inside the
#       container; node:22-alpine does not ship curl)
#
# Build checks (opt-in via --build):
#   docker build with PUBLIC_SITE_URL + container start listening
#   on a dynamic PORT injected at runtime (Coolify behavior)
#   -> SC-001, SC-002, SC-006
#
# Usage: bash scripts/validate-docker-coolify.sh [--build]
# Exit codes: 0 = all checks passed | 1 = at least one failure
# ============================================================
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKERFILE="$ROOT/Dockerfile"
DOCKERIGNORE="$ROOT/.dockerignore"
GITIGNORE="$ROOT/.gitignore"

failures=0

log_pass() {
  echo "PASS: $1"
}

log_fail() {
  echo "FAIL: $1"
  failures=$((failures + 1))
}

[ -f "$DOCKERFILE" ] || { echo "ERROR: Dockerfile not found at $DOCKERFILE"; exit 1; }
[ -f "$DOCKERIGNORE" ] || { echo "ERROR: .dockerignore not found at $DOCKERIGNORE"; exit 1; }
[ -f "$GITIGNORE" ] || { echo "ERROR: .gitignore not found at $GITIGNORE"; exit 1; }

echo "== Static checks =="

# (a) No Cloud Run port residues (ENV PORT=8080 / EXPOSE 8080)
if grep -qE '^[[:space:]]*(ENV[[:space:]]+PORT=8080|EXPOSE[[:space:]]+8080)[[:space:]]*$' "$DOCKERFILE"; then
  log_fail "Dockerfile hardcodes Cloud Run port (ENV PORT=8080 / EXPOSE 8080)"
else
  log_pass "Dockerfile does not hardcode ENV PORT=8080 nor EXPOSE 8080"
fi

# (b) ARG PUBLIC_SITE_URL declared for the sitemap build
if grep -qE '^ARG[[:space:]]+PUBLIC_SITE_URL[[:space:]]*$' "$DOCKERFILE"; then
  log_pass "Dockerfile declares ARG PUBLIC_SITE_URL"
else
  log_fail "Dockerfile is missing ARG PUBLIC_SITE_URL (sitemap build)"
fi

# (c) .dockerignore excludes local secret patterns
for pattern in '\.env' '\.env\.\*' '\*\.local'; do
  if grep -qE "^${pattern}$" "$DOCKERIGNORE"; then
    log_pass ".dockerignore excludes pattern: ${pattern}"
  else
    log_fail ".dockerignore is missing pattern: ${pattern}"
  fi
done

# (d) .env must not be tracked in git (secrets hygiene, SC-007)
tracked_env="$(git -C "$ROOT" ls-files .env 2>/dev/null)"
if [ -n "$tracked_env" ]; then
  log_fail ".env is tracked in git (fix: git rm --cached .env)"
else
  log_pass ".env is not tracked in git"
fi

# (e) .gitignore must declare .env (template .env.example stays tracked, SC-007)
if grep -qE '^\.env$' "$GITIGNORE"; then
  log_pass ".gitignore declares .env"
else
  log_fail ".gitignore is missing .env entry (add: .env)"
fi

# (f) Dockerfile must install curl for the platform healthcheck (post-archive fix:
#     Coolify runs its healthcheck inside the container; node:22-alpine lacks curl)
if grep -qE '^RUN[[:space:]]+apk[[:space:]]+add[[:space:]]+--no-cache[[:space:]]+curl[[:space:]]*$' "$DOCKERFILE"; then
  log_pass "Dockerfile installs curl for the platform healthcheck"
else
  log_fail "Dockerfile is missing apk add --no-cache curl (platform healthcheck fails: curl not found)"
fi

# --- Build checks (opt-in via --build) ---
if [ "${1:-}" = "--build" ]; then
  echo "== Build checks (--build) =="
  if ! command -v docker > /dev/null 2>&1; then
    log_fail "docker CLI not available; cannot run build checks"
  else
    image="webastro-landing:validate"
    test_port=3457
    if docker build --build-arg PUBLIC_SITE_URL="https://gabrielzavando.cl" -t "$image" "$ROOT"; then
      log_pass "docker build succeeded with PUBLIC_SITE_URL"
      container_id="$(docker run -d -e PORT="$test_port" -p "$test_port:$test_port" "$image")"
      ok=0
      for _ in 1 2 3 4 5 6 7 8 9 10; do
        if curl -fsS "http://localhost:$test_port/" > /dev/null 2>&1; then
          ok=1
          break
        fi
        sleep 1
      done
      if [ "$ok" -eq 1 ]; then
        log_pass "container answers HTTP 200 on dynamic PORT=$test_port"
      else
        log_fail "container did not answer on dynamic PORT=$test_port"
      fi
      if curl -fsS "http://localhost:$test_port/sitemap.xml" 2>/dev/null | grep -q "https://gabrielzavando.cl"; then
        log_pass "sitemap.xml uses PUBLIC_SITE_URL"
      else
        log_fail "sitemap.xml does not use PUBLIC_SITE_URL"
      fi
      # SC-003: verify no .env* files reached the image (build context + final image)
      builder_image="${image}-builder"
      if docker build --build-arg PUBLIC_SITE_URL="https://gabrielzavando.cl" --target builder -t "$builder_image" "$ROOT" > /dev/null 2>&1; then
        if docker run --rm "$builder_image" ls -A /app 2>/dev/null | grep -qE '^\.env'; then
          log_fail "builder stage contains .env* files (check .dockerignore)"
        else
          log_pass "builder stage build context contains no .env* files (SC-003)"
        fi
      else
        log_fail "builder target build failed; SC-003 check skipped"
      fi
      if docker run --rm "$image" ls -A /app 2>/dev/null | grep -qE '^\.env'; then
        log_fail "final image contains .env* files"
      else
        log_pass "final image contains no .env* files (SC-003)"
      fi
      # Healthcheck dependency: curl must be available in the production image
      if docker run --rm "$image" sh -c "command -v curl" > /dev/null 2>&1; then
        log_pass "curl is available in the production image (platform healthcheck)"
      else
        log_fail "curl is NOT available in the production image (platform healthcheck fails)"
      fi
      docker rm -f "$container_id" > /dev/null 2>&1
    else
      log_fail "docker build failed with PUBLIC_SITE_URL"
    fi
  fi
fi

echo "== Summary =="
if [ "$failures" -gt 0 ]; then
  echo "Validation FAILED with $failures failure(s)."
  exit 1
fi
echo "Validation PASSED."
