#!/usr/bin/env bash
set -euo pipefail
SDK_PIN=$(grep -oE 'OZ_SMART_ACCOUNT_WASM_HASH = "[0-9a-f]{64}"' \
  packages/accounts/src/oz-contract/wasm-pin.ts | grep -oE '[0-9a-f]{64}')
FAC=/Users/david/Projects/buckspay/facilitator/src/stellarContract.ts
test -f "$FAC" || { echo "FAIL: facilitator source not found at $FAC"; exit 1; }
FAC_PUBNET=$(grep -A2 '"stellar-pubnet"' "$FAC" | grep -oE '[0-9a-f]{64}' | head -1)
if [ "$SDK_PIN" != "$FAC_PUBNET" ]; then
  echo "FAIL: pin drift — SDK=$SDK_PIN  facilitator(pubnet)=$FAC_PUBNET"; exit 1
fi
echo "pin-parity: SDK pin === facilitator pubnet hash ($SDK_PIN)"; exit 0
