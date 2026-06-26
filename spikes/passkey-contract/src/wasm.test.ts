import { describe, it, expect } from "vitest";
import { verifyWasmHash, sha256Hex } from "./wasm.js";

describe("wasm hash verification (security: pin before install)", () => {
  it("computes a 64-hex sha256 over the wasm bytes", async () => {
    const bytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d]); // \0asm magic
    const hex = await sha256Hex(bytes);
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verifyWasmHash passes when the expected hash matches and throws otherwise", async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const good = await sha256Hex(bytes);
    await expect(verifyWasmHash(bytes, good)).resolves.toBe(good);
    await expect(verifyWasmHash(bytes, "0".repeat(64))).rejects.toThrow(/wasm hash mismatch/);
  });

  it("verifyWasmHash returns the computed hash when no expected hash is provided", async () => {
    const bytes = new Uint8Array([9, 9, 9]);
    const hex = await verifyWasmHash(bytes, undefined);
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
  });
});
