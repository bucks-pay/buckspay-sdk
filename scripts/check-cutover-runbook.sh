#!/usr/bin/env bash
set -euo pipefail
F="docs/ops/mainnet-cutover.md"
missing=0
for h in \
  "Mainnet Cutover Runbook" \
  "Pre-flight checklist" \
  "GO / NO-GO gate" \
  "Rollback" \
  "Sponsor-refill procedure" \
  "Emergency pause (kill-switch)" \
  "Incident response"; do
  grep -qF "$h" "$F" || { echo "MISSING section: $h"; missing=1; }
done
if [ "$missing" -ne 0 ]; then echo "cutover-runbook: incomplete"; exit 1; fi
echo "cutover-runbook: all 7 sections present"
