#!/usr/bin/env bash
set -euo pipefail
F="docs/production/mainnet-cutover.mdx"
missing=0
for h in \
  "Mainnet Cutover Runbook" \
  "Pre-flight checklist" \
  "GO / NO-GO gate" \
  "Rollback" \
  "Sponsor-refill procedure" \
  "Emergency pause (kill-switch)" \
  "Incident response" \
  "Extended surface go-live"; do
  grep -iqF "$h" "$F" || { echo "MISSING section: $h"; missing=1; }
done
if [ "$missing" -ne 0 ]; then echo "cutover-runbook: incomplete"; exit 1; fi
echo "cutover-runbook: all 8 sections present"
