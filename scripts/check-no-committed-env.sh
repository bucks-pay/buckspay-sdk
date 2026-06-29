#!/usr/bin/env bash
set -uo pipefail
# Guard 1: no tracked .env* (except .env.example) anywhere in the repo.
# Guard 2: the configured pubnet sponsor must NOT be the known-leaked address.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# The leaked Stellar sponsor public key from the facilitator .env.bak incident.
LEAKED_SPONSOR="GDKACWHUTPRUFHENFT56SL7XPM5FJU25DARE76OG43Q73XCATTUX4RPI"
fail=0

# --- Guard 1: tracked secret files ---
tracked="$(git -C "$ROOT" ls-files | grep -E '(^|/)\.env([._].*)?$' | grep -vE '(^|/)\.env\.example$' || true)"
if [ -n "$tracked" ]; then
  echo "FAIL: secret-bearing env file(s) are TRACKED by git:"
  echo "$tracked" | sed 's/^/  - /'
  echo "  -> git rm --cached the file, add it to .gitignore, and ROTATE every value (it is burned)."
  fail=1
else
  echo "no-committed-env: no tracked .env* (except .env.example)"
fi

# --- Guard 2: leaked sponsor must not be the configured pubnet sponsor ---
# Derive the configured pubnet sponsor's PUBLIC key from the secret WITHOUT printing the secret.
# Resolved from the facilitator repo's runtime env if available; skipped (not failed) when unset.
# @stellar/stellar-sdk resolves from a workspace package, not the repo root.
SPONSOR_SECRET="${STELLAR_SPONSOR_SECRET_PUBNET:-}"
if [ -n "$SPONSOR_SECRET" ]; then
  pub="$(cd "$ROOT/packages/core" && node -e '
    try {
      const { Keypair } = require("@stellar/stellar-sdk");
      process.stdout.write(Keypair.fromSecret(process.env.STELLAR_SPONSOR_SECRET_PUBNET).publicKey());
    } catch (e) { process.stdout.write("INVALID"); }
  ')"
  if [ "$pub" = "$LEAKED_SPONSOR" ]; then
    echo "FAIL: configured pubnet sponsor == the LEAKED sponsor ($LEAKED_SPONSOR). Generate a fresh sponsor."
    fail=1
  elif [ "$pub" = "INVALID" ]; then
    echo "FAIL: STELLAR_SPONSOR_SECRET_PUBNET is set but not a valid Stellar secret."
    fail=1
  else
    echo "no-committed-env: pubnet sponsor ${pub:0:6}… differs from the leaked address"
  fi
else
  echo "no-committed-env: STELLAR_SPONSOR_SECRET_PUBNET unset — sponsor-identity check SKIP"
fi

if [ "$fail" -ne 0 ]; then exit 1; fi
echo "no-committed-env: OK"
exit 0
