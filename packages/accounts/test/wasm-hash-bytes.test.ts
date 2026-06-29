import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { OZ_SMART_ACCOUNT_WASM_HASH } from "../src/oz-contract/wasm-pin.js";

const here = dirname(fileURLToPath(import.meta.url));
// A committed copy of the EXACT installed wasm bytes (the build artifact), used as the
// reproducibility fixture so CI can prove sha256(bytes) === pin without a Rust toolchain.
const FIXTURE = join(here, "fixtures", "oz-smart-account.wasm");

describe("OZ Smart Account wasm bytes match the pin", () => {
  it("the committed wasm fixture exists", () => {
    expect(existsSync(FIXTURE)).toBe(true);
  });
  it("sha256(wasm bytes) equals OZ_SMART_ACCOUNT_WASM_HASH", () => {
    const bytes = readFileSync(FIXTURE);
    const digest = createHash("sha256").update(bytes).digest("hex");
    expect(digest).toBe(OZ_SMART_ACCOUNT_WASM_HASH);
  });
});
