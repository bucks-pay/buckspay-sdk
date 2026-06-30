#!/usr/bin/env bash
# Single "did recent work break the released paths?" gate: the full unit suite (every package)
# green, plus the two parity goldens. Network e2e stays behind its own flags (release-gate.sh).
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== no-regression: full workspace unit suite =="
pnpm -r test
echo "== no-regression: parity goldens =="
pnpm --filter @buckspay/core exec vitest run no-regression-parity
echo "no-regression: all paths green; parity goldens hold"
