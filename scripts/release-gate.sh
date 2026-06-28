#!/usr/bin/env bash
# Release gate: runs every release-blocker check, prints PASS/FAIL/SKIP per item.
# Hard guards FAIL the gate; the audit + e2e items are REVIEW/SKIP (informational).
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
item() { # <label> <hard|soft> <command...>
  local label="$1" kind="$2"; shift 2
  if "$@" >/tmp/rg.out 2>&1; then
    echo "PASS  $label"
  else
    if [ "$kind" = "hard" ]; then echo "FAIL  $label"; fail=1; else echo "REVIEW $label (see output)"; fi
  fi
}

item "threat-model present"      hard bash scripts/check-threat-model.sh
item "no secrets in src"         hard bash scripts/check-no-secrets-in-src.sh
item "react bundle no-secret"    hard pnpm --filter @buckspay/react exec vitest run no-secret-in-bundle
item "expiration bounded"        hard pnpm --filter @buckspay/core exec vitest run expiration-bounded
item "mainnet gated"             hard pnpm --filter @buckspay/core exec vitest run network-gate
item "OZ wasm hash pinned"       hard pnpm --filter @buckspay/accounts exec vitest run oz-wasm-pin
item "licenses allow-list"       hard node scripts/check-licenses.mjs
item "pnpm audit (transitive)"   soft pnpm audit --audit-level=high --prod

# e2e honors the BUCKSPAY_E2E gate; skips cleanly when unconfigured.
if [ "${BUCKSPAY_E2E:-}" = "1" ]; then
  item "e2e testnet" soft pnpm e2e
else
  echo "SKIP  e2e testnet (set BUCKSPAY_E2E=1 to run)"
fi

echo "----"
if [ "$fail" -eq 0 ]; then echo "release-gate: all hard guards PASS"; exit 0; else echo "release-gate: FAILED"; exit 1; fi
