#!/usr/bin/env node
// check-doc-snippets.mjs — drift guard (CI).
//
// Reads every snippet block in docs/**/*.mdx and compares the embedded code body
// to docs/examples/<file>.  Exits 1 if any block is out of sync or a referenced
// file is missing.  Read-only — never writes.

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync } from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const DOCS_DIR = join(ROOT, "docs");
const EXAMPLES_DIR = join(DOCS_DIR, "examples");

// ── helpers ──────────────────────────────────────────────────────────────────

function findMdxFiles(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || full === EXAMPLES_DIR) continue;
      findMdxFiles(full, results);
    } else if (entry.endsWith(".mdx")) {
      results.push(full);
    }
  }
  return results;
}

// Short inline diff: shows first differing line.
function shortDiff(actual, expected) {
  const aLines = actual.split("\n");
  const eLines = expected.split("\n");
  const len = Math.max(aLines.length, eLines.length);
  for (let i = 0; i < len; i++) {
    if (aLines[i] !== eLines[i]) {
      return `  line ${i + 1} in doc : ${JSON.stringify(aLines[i] ?? "(missing)")}\n  line ${i + 1} in src : ${JSON.stringify(eLines[i] ?? "(missing)")}`;
    }
  }
  return "  (differs in whitespace or line count)";
}

const BLOCK_RE =
  /\{\/\* @snippet:start (\S+) \*\/\}\n```(\w+)\n([\s\S]*?)```\n\{\/\* @snippet:end \*\/\}/g;

// ── main ─────────────────────────────────────────────────────────────────────

const mdxFiles = findMdxFiles(DOCS_DIR);
let totalSnippets = 0;
let failures = 0;

for (const file of mdxFiles) {
  const content = readFileSync(file, "utf8");
  const relFile = relative(ROOT, file);

  const startMarkers = (content.match(/\{\/\* @snippet:start /g) || []).length;
  let matchedInFile = 0;

  for (const match of content.matchAll(BLOCK_RE)) {
    const [, exampleFile, , embeddedBody] = match;
    const examplePath = join(EXAMPLES_DIR, exampleFile);
    totalSnippets++;
    matchedInFile++;

    let source;
    try {
      source = readFileSync(examplePath, "utf8");
    } catch {
      console.error(`FAIL  ${relFile}: missing example file docs/examples/${exampleFile}`);
      failures++;
      continue;
    }

    // Normalise: ensure source ends with single newline (same as sync script)
    const expected = source.endsWith("\n") ? source : source + "\n";

    if (embeddedBody !== expected) {
      console.error(`FAIL  ${relFile}: snippet "${exampleFile}" is out of sync.`);
      console.error(shortDiff(embeddedBody, expected));
      failures++;
    }
  }

  // A @snippet:start that the strict block regex did NOT match is a malformed marker
  // (missing fence/@snippet:end, blank line, or bad spacing) — it would be silently
  // un-injected AND un-guarded, so a later code change could drift undetected. Fail it.
  if (matchedInFile !== startMarkers) {
    console.error(
      `FAIL  ${relFile}: ${startMarkers} @snippet:start marker(s) but ${matchedInFile} well-formed block(s) — a malformed marker is silently un-injected and un-guarded.`
    );
    failures++;
  }
}

if (failures > 0) {
  console.error(`\ndoc-snippets: ${failures} out-of-sync block(s). Run: node scripts/sync-doc-snippets.mjs`);
  process.exit(1);
}

console.log(`doc-snippets: ${totalSnippets} snippet(s) in sync.`);
