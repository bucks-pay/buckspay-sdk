#!/usr/bin/env node
// Verify the OZ Smart Account wasm bytes hash to the pinned constant.
//
// Toolchain (reproducible build — see docs/production/security/contract-provenance.mdx):
//   stellar CLI 25.2.0, cargo/rustc 1.93, crate spikes/passkey-contract/contract
//   `stellar contract build && stellar contract optimize --wasm <built>.wasm`
// The pre-built, byte-identical artifact ships at spikes/passkey-contract/wasm/
// and is committed as a test fixture at packages/accounts/test/fixtures/oz-smart-account.wasm.
//
// Usage:
//   node scripts/verify-wasm-hash.mjs                 # hashes the committed fixture
//   node scripts/verify-wasm-hash.mjs --wasm <path>   # hashes an explicit .wasm
//   node scripts/verify-wasm-hash.mjs --build         # builds the crate, then hashes the artifact
// Exits 0 only if sha256(bytes) === OZ_SMART_ACCOUNT_WASM_HASH; non-zero otherwise.
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const PIN = readFileSync(
  join(ROOT, "packages/accounts/src/oz-contract/wasm-pin.ts"),
  "utf8"
).match(/OZ_SMART_ACCOUNT_WASM_HASH\s*=\s*"([0-9a-f]{64})"/)?.[1];
if (!PIN) {
  console.error("FAIL: could not read OZ_SMART_ACCOUNT_WASM_HASH from wasm-pin.ts");
  process.exit(2);
}

const CRATE = join(ROOT, "spikes/passkey-contract/contract");
const BUILT = join(CRATE, "target/wasm32v1-none/release/minimal_passkey_account.optimized.wasm");
const FIXTURE = join(ROOT, "packages/accounts/test/fixtures/oz-smart-account.wasm");

const args = process.argv.slice(2);
let wasmPath = FIXTURE;
const wasmFlag = args.indexOf("--wasm");
if (wasmFlag !== -1) wasmPath = resolve(args[wasmFlag + 1] ?? "");
if (args.includes("--build")) {
  console.log("building wasm (stellar contract build + optimize)…");
  execFileSync("stellar", ["contract", "build"], { cwd: CRATE, stdio: "inherit" });
  execFileSync(
    "stellar",
    ["contract", "optimize", "--wasm", join(CRATE, "target/wasm32v1-none/release/minimal_passkey_account.wasm")],
    { cwd: CRATE, stdio: "inherit" }
  );
  wasmPath = BUILT;
}

if (!existsSync(wasmPath)) {
  console.error(`FAIL: wasm not found at ${wasmPath} (build with --build or pass --wasm <path>)`);
  process.exit(2);
}
const actual = createHash("sha256").update(readFileSync(wasmPath)).digest("hex");
if (actual !== PIN) {
  console.error(`FAIL: wasm hash mismatch\n  expected (pin): ${PIN}\n  actual (bytes): ${actual}\n  file: ${wasmPath}`);
  process.exit(1);
}
console.log(`verify-wasm-hash: OK — sha256(${wasmPath}) === pin ${PIN}`);
process.exit(0);
