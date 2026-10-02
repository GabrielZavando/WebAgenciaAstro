#!/usr/bin/env bash
# ============================================================
# validate-workflows-cleanup.sh
# Static validation for the removal of the obsolete Cloud Run
# GitHub workflows of the frontend (change:
# cleanup-obsolete-frontend-workflows).
#
# Static checks (always run):
#   (a) preview.yml, deploy.yml and cleanup.yml must be ABSENT
#       from .github/workflows/              -> SC-001/SC-002/SC-003
#   (b) ci.yml must be PRESENT in
#       .github/workflows/                   -> SC-004
#   (c) .env.example must keep PUBLIC_API_URL and
#       PUBLIC_API_BASE_URL; src/lib/api-client.ts must keep
#       PUBLIC_API_URL                       -> SC-005
#   (d) .github/workflows/ must contain zero Cloud Run deploy
#       references (gcloud run, run.app,
#       us-central1-docker.pkg.dev)          -> SC-006
#
# Usage: bash scripts/validate-workflows-cleanup.sh
# Exit codes: 0 = all checks passed | 1 = at least one failure
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOWS_DIR="$ROOT/.github/workflows"
ENV_EXAMPLE="$ROOT/.env.example"
API_CLIENT="$ROOT/src/lib/api-client.ts"

failures=0

log_pass() {
  echo "PASS: $1"
}

log_fail() {
  echo "FAIL: $1"
  failures=$((failures + 1))
}

[ -d "$WORKFLOWS_DIR" ] || { echo "ERROR: .github/workflows not found at $WORKFLOWS_DIR"; exit 1; }
[ -f "$ENV_EXAMPLE" ] || { echo "ERROR: .env.example not found at $ENV_EXAMPLE"; exit 1; }
[ -f "$API_CLIENT" ] || { echo "ERROR: src/lib/api-client.ts not found at $API_CLIENT"; exit 1; }

echo "== Static checks =="

# (a) Obsolete Cloud Run workflows must be absent (SC-001, SC-002, SC-003)
for workflow in preview.yml deploy.yml cleanup.yml; do
  if [ -e "$WORKFLOWS_DIR/$workflow" ]; then
    log_fail "obsolete workflow still present: .github/workflows/$workflow (fix: git rm .github/workflows/$workflow)"
  else
    log_pass "obsolete workflow absent: .github/workflows/$workflow"
  fi
done

# (b) ci.yml must remain present (SC-004)
if [ -f "$WORKFLOWS_DIR/ci.yml" ]; then
  log_pass "ci.yml is present in .github/workflows/"
else
  log_fail "ci.yml is missing from .github/workflows/ (must stay intact)"
fi

# (c) Backend API config preserved (SC-005)
if grep -q 'PUBLIC_API_URL' "$ENV_EXAMPLE"; then
  log_pass ".env.example declares PUBLIC_API_URL"
else
  log_fail ".env.example is missing PUBLIC_API_URL (backend API config must be preserved)"
fi

if grep -q 'PUBLIC_API_BASE_URL' "$ENV_EXAMPLE"; then
  log_pass ".env.example declares PUBLIC_API_BASE_URL"
else
  log_fail ".env.example is missing PUBLIC_API_BASE_URL (backend API config must be preserved)"
fi

if grep -q 'PUBLIC_API_URL' "$API_CLIENT"; then
  log_pass "src/lib/api-client.ts uses PUBLIC_API_URL"
else
  log_fail "src/lib/api-client.ts is missing PUBLIC_API_URL (backend API config must be preserved)"
fi

# (d) Zero Cloud Run deploy references in workflows (SC-006)
cloud_run_matches="$(grep -rEn 'gcloud[[:space:]]+run|run\.app|us-central1-docker\.pkg\.dev' "$WORKFLOWS_DIR" || true)"
if [ -n "$cloud_run_matches" ]; then
  log_fail "Cloud Run deploy references found in .github/workflows/"
  while IFS= read -r match_line; do
    echo "  $match_line"
  done <<< "$cloud_run_matches"
else
  log_pass "no Cloud Run deploy references in .github/workflows/ (gcloud run, run.app, us-central1-docker.pkg.dev)"
fi

echo "== Summary =="
if [ "$failures" -gt 0 ]; then
  echo "Validation FAILED with $failures failure(s)."
  exit 1
fi
echo "Validation PASSED."
