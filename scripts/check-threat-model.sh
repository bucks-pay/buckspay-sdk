#!/usr/bin/env bash
set -euo pipefail
F="docs/production/security/threat-model.mdx"
missing=0
for h in "Signer custody" "Relayer trust" "Sponsor-key exposure" "Replay" "rpId" "Tenant isolation"; do
  grep -q "$h" "$F" || { echo "MISSING heading: $h"; missing=1; }
done
if [ "$missing" -ne 0 ]; then echo "threat-model: incomplete"; exit 1; fi
echo "threat-model: all 6 surfaces present"
