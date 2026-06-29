#!/usr/bin/env bash
set -euo pipefail
DOC="docs/security/contract-provenance.md"
test -f "$DOC" || { echo "FAIL: $DOC missing"; exit 1; }
for h in "## Deployed wasm" "## Source & commit" "## Reproducible build" \
         "## Audit-scope consequence" "## Pin & install" "## Sign-off"; do
  grep -qF "$h" "$DOC" || { echo "FAIL: missing heading: $h"; exit 1; }
done
# The pin must appear (the doc records the exact deployed bytes' hash).
grep -qF "bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69" "$DOC" \
  || { echo "FAIL: pinned wasm hash not recorded in provenance doc"; exit 1; }
# The custom-wrapper fact must be stated (not the official OZ release).
grep -qiE "NOT the official|custom .*wrapper|minimal-passkey-account" "$DOC" \
  || { echo "FAIL: provenance doc must state the wasm is the custom wrapper, not the official OZ release"; exit 1; }
# audit-prep must now name the wrapper in scope.
grep -qF "minimal-passkey-account" docs/security/audit-prep.md \
  || { echo "FAIL: audit-prep.md does not name the custom wrapper in scope"; exit 1; }
echo "contract-provenance: doc complete + audit-prep scope updated"; exit 0
