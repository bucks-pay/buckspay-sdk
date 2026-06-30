#!/usr/bin/env bash
# Release gate: the three contract decision gates (fee-forwarder / multicall / policy-signer) must
# each be DECISION=GO and have pinned their golden fixture, or the feature surface they unblock
# (gas-in-token / batch / sessions) is not cleared for GA.
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0
check() { # <decision-dir> <fixture-glob> <label>
  local dir="$1" fixture="$2" label="$3"
  if [ ! -f "$dir/DECISION.md" ]; then echo "MISSING $label: $dir/DECISION.md"; fail=1; return; fi
  # DECISION.md template: "## DECISION\n- [x] **GO** …\n- [ ] NO-GO". Checked = [x] … GO
  # (the `[ ] NO-GO` line never matches: its checkbox is a space, not x/X).
  if ! grep -qiE '\[[xX]\][[:space:]*]+GO' "$dir/DECISION.md"; then
    echo "NO-GO (or unfilled) $label: $dir/DECISION.md not marked [x] GO"; fail=1
  fi
  # shellcheck disable=SC2086
  if ! ls $dir/$fixture >/dev/null 2>&1; then echo "MISSING $label golden: $dir/$fixture"; fail=1; fi
}
check spikes/sp2-fee-forwarder "fixtures/fee-forward-payload.json" "fee-forwarder gate"
check spikes/sp2-multicall     "fixtures/*.json"                   "multicall gate"
check spikes/sp2-policy-signer "fixtures/policy-install.json"      "policy-signer gate"
if [ "$fail" -ne 0 ]; then echo "contract decisions: NOT all GO"; exit 1; fi
echo "contract decisions: all 3 gates GO + fixtures pinned"
