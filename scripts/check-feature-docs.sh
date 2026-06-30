#!/usr/bin/env bash
# Feature-docs gate: every feature guide page + its compiled example must exist, and the
# feature-coverage table must map each feature to its native Stellar mechanism.
set -euo pipefail
cd "$(dirname "$0")/.."
missing=0
for f in \
  "docs/guide/08-gas-in-token.md" "docs/guide/09-atomic-batch.md" \
  "docs/guide/10-sessions.md" "docs/guide/11-social-email-login.md" \
  "docs/guide/12-react-native.md" "docs/guide/13-feature-coverage.md" \
  "docs/examples/09-gas-in-token.ts" "docs/examples/10-batch.ts" \
  "docs/examples/11-sessions.ts" "docs/examples/12-social-login.ts" \
  "docs/examples/13-react-native.tsx"; do
  [ -f "$f" ] || { echo "MISSING: $f"; missing=1; }
done
# 14-swap.ts is optional — present if swaps was kept, absent if cut. Either is valid; just report.
[ -f "docs/examples/14-swap.ts" ] && echo "note: swaps KEPT (14-swap.ts present)" || echo "note: swaps CUT (14-swap.ts absent)"
# The coverage table must name each native mechanism.
for k in "FeeForwarder" "Multicall" "policy signers" "ed25519" "native passkey"; do
  grep -qF "$k" docs/guide/13-feature-coverage.md || { echo "MISSING coverage mechanism: $k"; missing=1; }
done
if [ "$missing" -ne 0 ]; then echo "feature-docs: incomplete"; exit 1; fi
echo "feature-docs: all feature guides + examples present, coverage table complete"
