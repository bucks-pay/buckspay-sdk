import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { OZ_SMART_ACCOUNT_WASM_HASH } from "../src/oz-contract/wasm-pin.js";

// The facilitator lives in a sibling repo; we read its source text (no import across repos).
const FAC = "/Users/david/Projects/buckspay/facilitator/src/stellarContract.ts";

/** Extract the facilitator's configured pubnet wasm hash literal (the fallback after `??`). */
function facilitatorPubnetHash(src: string): string | null {
  // matches:  "stellar-pubnet": process.env.OZ_..._PUBNET ?? "bf1a…",   OR a bare "…": "bf1a…"
  const block = src.match(/"stellar-pubnet"\s*:[\s\S]*?"([0-9a-f]{64})"/);
  return block?.[1] ?? null;
}

describe("cross-repo OZ wasm pin parity", () => {
  it("the facilitator source is reachable", () => {
    expect(existsSync(FAC)).toBe(true);
  });
  it("facilitator pubnet hash === SDK pin (byte-for-byte)", () => {
    const facHash = facilitatorPubnetHash(readFileSync(FAC, "utf8"));
    expect(facHash).toBe(OZ_SMART_ACCOUNT_WASM_HASH);
  });
});
