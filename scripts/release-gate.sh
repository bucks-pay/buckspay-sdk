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

# --- mainnet closeout blockers ---
item "no committed env / sponsor != leaked"  hard bash scripts/check-no-committed-env.sh
item "secret-rotation runbook present"       hard test -f docs/security/secret-rotation.md
item "no unexpected copyleft in prod tree"   hard pnpm --filter @buckspay/signers exec vitest run no-unexpected-copyleft
item "wasm-hash pin reproducible"            hard node scripts/verify-wasm-hash.mjs
item "cross-repo wasm-pin parity"            hard bash scripts/check-pin-parity.sh
item "cutover runbook present"               hard bash scripts/check-cutover-runbook.sh
item "feature docs + examples present"       hard bash scripts/check-feature-docs.sh

# --- onboarding/sessions/swap contract blockers ---
# The contract decision gates (fee-forwarder / multicall / policy-signer) gate gas-in-token /
# batch / sessions; their DECISIONs must be GO + fixtures pinned. The contract pins are the
# policy-account wasm hash and the Multicall router address; the FeeForwarder is facilitator-side
# (returned by /fee/quote), covered by the decision guard above.
item "contract decision gates GO"    hard bash scripts/check-contract-decisions.sh
item "policy-account wasm pinned"    hard pnpm --filter @buckspay/accounts exec vitest run policy-account
item "multicall router pinned"       hard pnpm --filter @buckspay/accounts exec vitest run batch-entry
item "no-regression goldens"         hard pnpm --filter @buckspay/core exec vitest run no-regression-parity

# Gated mainnet smoke: honors BUCKSPAY_E2E_MAINNET; skips when unset. Runs the full e2e suite —
# including the cross-feature pubnet smoke, which is itself gated on MAINNET_ENABLED.
if [ "${BUCKSPAY_E2E_MAINNET:-}" = "1" ]; then
  item "mainnet smoke" soft env BUCKSPAY_E2E=1 pnpm e2e
else
  echo "SKIP  mainnet smoke + cross-feature (set BUCKSPAY_E2E_MAINNET=1 to run)"
fi

# Swap quote smoke (stretch): honors BUCKSPAY_E2E_SWAP; skips when unset (or when swaps is disabled).
if [ "${BUCKSPAY_E2E_SWAP:-}" = "1" ]; then
  item "swap quote smoke (stretch)" soft env BUCKSPAY_E2E=1 pnpm e2e
else
  echo "SKIP  swap quote smoke (stretch; set BUCKSPAY_E2E_SWAP=1 to run, or N/A if disabled)"
fi

# e2e honors the BUCKSPAY_E2E gate; skips cleanly when unconfigured.
if [ "${BUCKSPAY_E2E:-}" = "1" ]; then
  item "e2e testnet" soft pnpm e2e
else
  echo "SKIP  e2e testnet (set BUCKSPAY_E2E=1 to run)"
fi

echo "----"
if [ "$fail" -eq 0 ]; then echo "release-gate: all hard guards PASS"; exit 0; else echo "release-gate: FAILED"; exit 1; fi
