#!/usr/bin/env node
// postprocess-sdk-reference.mjs — make TypeDoc's markdown output Mintlify-compatible.
//
// TypeDoc + typedoc-plugin-markdown emits files Mintlify cannot serve as-is:
//   (a) no YAML frontmatter — Mintlify needs a `title` or the route 404s;
//   (b) a breadcrumb + horizontal-rule header (TypeDoc nav chrome, ugly in Mintlify);
//   (c) internal links carry a `.md` extension — Mintlify wants extensionless;
//   (d) folder landing pages named `README.md` — Mintlify does NOT route `README`
//       (it uses `index`), so every package landing 404s;
//   (e) internal links are RELATIVE (`classes/Foo`, `../index`) — Mintlify routes by
//       ABSOLUTE paths from the docs root (`/sdk-reference/...`), so links 404.
// Runs after `typedoc` (the `docs:api` script). Idempotent.

import { readFileSync, writeFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, dirname, relative, sep, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const DIR = join(DOCS, "sdk-reference");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

const yamlString = (s) => s.replace(/`/g, "").replace(/\\/g, "").replace(/"/g, "'").trim();

let frontmattered = 0;
let renamed = 0;
for (const file of walk(DIR)) {
  let body = readFileSync(file, "utf8");

  // (a)+(b) frontmatter + strip leading breadcrumb chrome (only once).
  if (!body.startsWith("---\n")) {
    const h1 = body.match(/^#\s+(.+)$/m);
    let title = "Reference";
    if (h1) {
      title = h1[1].trim();
      body = body.slice(body.indexOf(h1[0]));
    }
    body = `---\ntitle: "${yamlString(title)}"\n---\n\n` + body;
    frontmattered++;
  }

  // (c) strip `.md` from internal link targets.
  body = body.replace(/\]\(([^)]+?)\.md(#[^)]*)?\)/g, (_m, p, anchor) => `](${p}${anchor || ""})`);
  // (d) rewrite README -> index in link targets.
  body = body.replace(/\]\(([^)]*?)README([)#])/g, (_m, p, tail) => `](${p}index${tail}`);

  // (e) relative -> absolute Mintlify path, resolved against this file's location.
  const fileDirRel = relative(DOCS, dirname(file)).split(sep).join("/"); // e.g. sdk-reference/core/src
  body = body.replace(/\]\(([^)]+)\)/g, (m, target) => {
    if (/^(https?:|\/|#|mailto:|tel:)/.test(target)) return m; // external / already-absolute / anchor
    const hash = target.indexOf("#");
    const path = hash === -1 ? target : target.slice(0, hash);
    const anchor = hash === -1 ? "" : target.slice(hash);
    if (!path) return m; // pure anchor handled above, but guard anyway
    const abs = "/" + posix.normalize(posix.join(fileDirRel, path)).replace(/^\/+/, "");
    return `](${abs}${anchor})`;
  });

  // (d) rename README.md -> index.md.
  const isReadme = /(^|\/)README\.md$/.test(file);
  const target = isReadme ? join(dirname(file), "index.md") : file;
  writeFileSync(target, body);
  if (isReadme) {
    rmSync(file);
    renamed++;
  }
}

console.log(`sdk-reference postprocess: ${frontmattered} frontmatter, ${renamed} README->index, links -> absolute.`);
