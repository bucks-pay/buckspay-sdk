#!/usr/bin/env bash
set -euo pipefail
# Stellar secret seeds, PEM private-key markers, and hardcoded apiKey string literals.
if git grep -nE 'S[A-Z2-7]{55}|PRIVATE KEY|apiKey[[:space:]]*[:=][[:space:]]*["'\''][A-Za-z0-9]{16,}' -- 'packages/*/src'; then
  echo "FAIL: secret-shaped material found in packages/*/src"
  exit 1
fi
echo "key-handling: no secret-shaped material in packages/*/src"
exit 0
