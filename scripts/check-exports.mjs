import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const expected = [
  "packages/core/dist/index.js",
  "packages/accounts/dist/index.js",
  "packages/accounts/dist/classic.js",
  "packages/accounts/dist/oz-contract.js",
  "packages/signers/dist/index.js",
  "packages/signers/dist/wallets-kit.js",
  "packages/signers/dist/passkey.js",
  "packages/relayer/dist/index.js",
  "packages/relayer/dist/buckspay-facilitator.js",
  "packages/react/dist/index.js"
];

for (const rel of expected) {
  assert.ok(existsSync(join(root, rel)), `missing build output: ${rel}`);
  assert.ok(existsSync(join(root, rel.replace(/\.js$/, ".cjs"))), `missing CJS output: ${rel}`);
  assert.ok(existsSync(join(root, rel.replace(/\.js$/, ".d.ts"))), `missing dts output: ${rel}`);
}
console.log("all dist exports present");
