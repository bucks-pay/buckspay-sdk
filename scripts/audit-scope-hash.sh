#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# The in-scope source tree for the v1 audit: the SDK packages under audit + the custom
# contract wrapper recorded in contract-provenance.md. Sorted, NUL-safe, content-hashed.
# Any change to in-scope code changes the hash → an old sign-off no longer matches.
git ls-files -z -- \
  'packages/core/src/**' \
  'packages/accounts/src/oz-contract/**' \
  'packages/signers/src/passkey/**' \
  'packages/signers/src/wallets-kit/**' \
  'packages/relayer/src/buckspay-facilitator/**' \
  'packages/react/src/**' \
  'spikes/passkey-contract/contract/src/**' \
  | sort -z \
  | xargs -0 shasum -a 256 \
  | shasum -a 256 \
  | awk '{print $1}'
