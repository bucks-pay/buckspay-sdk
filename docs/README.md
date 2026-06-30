# Buckspay SDK Docs — developer notes

This directory is the Mintlify documentation source for the Buckspay SDK. It is **not** a Mintlify
page; it is a developer README for contributors.

## Running locally

```bash
pnpm docs:dev
# equivalent to: npx mintlify@4.2.649 dev
```

Mintlify serves the docs at `http://localhost:3000`. The `docs/docs.json` navigation config and
all `docs/**/*.mdx` pages are hot-reloaded.

## Snippet workflow

Code blocks in `.mdx` pages are synced from the typechecked source files under `docs/examples/`.
Run the following before editing any code block in an `.mdx` file:

```bash
pnpm docs:sync        # pull latest from docs/examples/ into the .mdx files
pnpm docs:check       # verify no drift (also runs in CI via release-gate.sh)
pnpm docs:typecheck   # typecheck the examples package
```

Never hand-edit a fenced code block that has a `// @buckspay-example: <file>` sync marker —
edit the corresponding file in `docs/examples/` and re-run `pnpm docs:sync`.

## CI guards

The following guards run as part of `bash scripts/release-gate.sh`:

- `node scripts/check-doc-snippets.mjs` — snippet no-drift (hard gate).
- `bash scripts/check-docs-no-internal-refs.sh` — no internal planning refs in public pages (hard gate).
- `bash scripts/check-feature-docs.sh` — all feature guide pages + examples present (hard gate).
- `bash scripts/check-cutover-runbook.sh` — mainnet cutover runbook has all 8 sections (hard gate).

Run `pnpm docs:check` locally before pushing any doc change.

## Deploying

**The maintainer owns this step — Claude does not execute deploy.**

1. Connect the Mintlify GitHub app to this repository (Settings → GitHub app → authorize).
2. Set the custom domain and DNS in the Mintlify dashboard (account-bound, outward-facing).
3. Mintlify auto-generates `llms.txt` and `llms-full.txt` on each deploy — no manual action needed.

The `contextual.options` field in `docs/docs.json` wires the AI-assistant surface (copy/view/chatgpt/claude/cursor/vscode).
