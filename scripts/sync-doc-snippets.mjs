#!/usr/bin/env node
// sync-doc-snippets.mjs — inject typechecked examples into MDX snippet blocks.
//
// Marker convention in .mdx:
//   {/* @snippet:start 01-quickstart-classic.ts */}
//   ```ts
//   // (injected from docs/examples/01-quickstart-classic.ts — do not edit by hand)
//   ```
//   {/* @snippet:end */}
//
// This script replaces the fenced code body between markers with the current
// file contents from docs/examples/<file>.  Idempotent.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

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
      // Skip examples and node_modules
      if (entry === "node_modules" || full === EXAMPLES_DIR) continue;
      findMdxFiles(full, results);
    } else if (entry.endsWith(".mdx")) {
      results.push(full);
    }
  }
  return results;
}

function extToLang(filename) {
  if (filename.endsWith(".tsx")) return "tsx";
  if (filename.endsWith(".ts")) return "ts";
  if (filename.endsWith(".js")) return "js";
  if (filename.endsWith(".jsx")) return "jsx";
  return "ts";
}

// Regex that matches a full snippet block.
// Groups: [1] = example filename, [2] = fence language, [3] = code body, [4] = closing fence
const BLOCK_RE =
  /\{\/\* @snippet:start (\S+) \*\/\}\n```(\w+)\n([\s\S]*?)```\n\{\/\* @snippet:end \*\/\}/g;

// ── main ─────────────────────────────────────────────────────────────────────

const mdxFiles = findMdxFiles(DOCS_DIR);
let totalSnippets = 0;
let modifiedFiles = 0;
let errors = 0;

for (const file of mdxFiles) {
  const original = readFileSync(file, "utf8");
  let updated = original;

  updated = updated.replace(BLOCK_RE, (match, exampleFile, _lang, _body) => {
    const examplePath = join(EXAMPLES_DIR, exampleFile);
    let source;
    try {
      source = readFileSync(examplePath, "utf8");
    } catch {
      console.error(`ERROR: Missing example file: ${examplePath} (referenced in ${relative(ROOT, file)})`);
      errors++;
      return match; // leave block unchanged
    }

    const lang = extToLang(exampleFile);
    // Ensure source ends with a single newline
    const body = source.endsWith("\n") ? source : source + "\n";
    totalSnippets++;
    return `{/* @snippet:start ${exampleFile} */}\n\`\`\`${lang}\n${body}\`\`\`\n{/* @snippet:end */}`;
  });

  if (updated !== original) {
    writeFileSync(file, updated, "utf8");
    modifiedFiles++;
  }
}

if (errors > 0) {
  console.error(`\nSync failed: ${errors} missing example file(s).`);
  process.exit(1);
}

console.log(`doc-snippets sync: ${totalSnippets} snippet(s) synced across ${modifiedFiles} file(s).`);
