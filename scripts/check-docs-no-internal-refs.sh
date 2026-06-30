#!/usr/bin/env bash
# check-docs-no-internal-refs.sh — public-cleanliness guard (CI).
#
# Greps docs/**/*.mdx and docs/docs.json for internal planning references that
# must never appear in the public documentation site.
#
# Patterns rejected:
#   SP-1 / SP-2 (word boundary)
#   sprint followed by optional space/hyphen and a digit
#   \bspike  — but the LITERAL substring "spikes/" is ALLOWED (directory paths)
#   dogfood
#   \bM[0-9]\b  (milestone codes like M0, M1 … M9)
#   Appendix A / Appendix B (word boundary)
#   Fase followed by a digit
#
# Excluded: docs/node_modules, docs/examples/node_modules

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$REPO_ROOT/docs"

FOUND=0

while IFS= read -r -d '' FILE; do
  while IFS= read -r HIT; do
    echo "$HIT"
    FOUND=1
  done < <(
    perl -ne '
      my $line = $_;
      chomp $line;
      my $hit = 0;

      # SP-1 or SP-2 at word boundary (hyphen optional: also catches SP1/SP2)
      $hit = 1 if $line =~ /\bSP-?[12]\b/;

      # sprint followed by optional space/hyphen and a digit
      $hit = 1 if $line =~ /sprint[ -]?[0-9]/i;

      # spike (word boundary) BUT allow "spikes/" (literal directory path)
      if ($line =~ /\bspike/i) {
        # Remove all occurrences of "spikes/" and check if "spike" still appears
        my $stripped = $line;
        $stripped =~ s{spikes/}{}gi;
        $hit = 1 if $stripped =~ /\bspike/i;
      }

      # dogfood
      $hit = 1 if $line =~ /dogfood/i;

      # M0..M9 as standalone word (milestone codes)
      $hit = 1 if $line =~ /\bM[0-9]\b/;

      # Appendix A or Appendix B
      $hit = 1 if $line =~ /\bAppendix [AB]\b/;

      # Fase followed by a digit
      $hit = 1 if $line =~ /\bFase [0-9]/;

      if ($hit) {
        print "'"$FILE"':$.: $line\n";
      }
    ' "$FILE"
  )
done < <(
  find "$DOCS_DIR" \
    \( -name "node_modules" -o -path "$DOCS_DIR/node_modules" -o -path "$DOCS_DIR/examples/node_modules" \) -prune \
    -o \( -name "*.mdx" -o -name "docs.json" \) -print0;
  find "$DOCS_DIR/sdk-reference" -name "*.md" -print0 2>/dev/null
)

if [[ $FOUND -ne 0 ]]; then
  echo ""
  echo "docs-no-internal-refs: FAIL — internal planning references found above."
  exit 1
fi

echo "docs-no-internal-refs: clean"
