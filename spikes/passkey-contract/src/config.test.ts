import { describe, it, expect } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { passkeySpikeConfigSchema, TESTNET } from "./config.js";

const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

/** A fully-valid env. Keys are generated so they always satisfy the StrKey regexes. */
function validEnv(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    SOROBAN_RPC_URL: "https://soroban-testnet.stellar.org",
    HORIZON_URL: "https://horizon-testnet.stellar.org",
    SPONSOR_SECRET: Keypair.random().secret(),
    USDC_SAC,
    RECIPIENT_PUBLIC_KEY: Keypair.random().publicKey(),
    OZ_SMART_ACCOUNT_WASM_PATH: "./wasm/oz_smart_account.wasm",
    ...overrides
  };
}

describe("passkey spike config", () => {
  it("rejects an empty env", () => {
    expect(passkeySpikeConfigSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a malformed sponsor secret", () => {
    expect(passkeySpikeConfigSchema.safeParse(validEnv({ SPONSOR_SECRET: "nope" })).success).toBe(false);
  });

  it("accepts a populated env and exposes testnet constants", () => {
    const parsed = passkeySpikeConfigSchema.safeParse(validEnv());
    expect(parsed.success).toBe(true);
    expect(TESTNET.networkPassphrase).toContain("Test SDF Network");
  });

  it("accepts a 64-hex wasm hash and rejects a short one", () => {
    expect(passkeySpikeConfigSchema.safeParse(validEnv({ OZ_SMART_ACCOUNT_WASM_HASH: "a".repeat(64) })).success).toBe(
      true
    );
    expect(passkeySpikeConfigSchema.safeParse(validEnv({ OZ_SMART_ACCOUNT_WASM_HASH: "abc" })).success).toBe(false);
  });
});
