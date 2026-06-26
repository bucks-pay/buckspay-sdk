import { describe, it, expect } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { spikeConfigSchema, TESTNET } from "./config.js";

const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

/** A fully-valid env. Keys are generated so they always satisfy the StrKey regexes. */
function validEnv(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    FACILITATOR_URL: "https://facilitator.example/",
    FACILITATOR_API_KEY: "k",
    SOROBAN_RPC_URL: "https://soroban-testnet.stellar.org",
    HORIZON_URL: "https://horizon-testnet.stellar.org",
    USDC_SAC,
    PAYER_SECRET: Keypair.random().secret(),
    RECIPIENT_PUBLIC_KEY: Keypair.random().publicKey(),
    ...overrides
  };
}

describe("spike config", () => {
  it("rejects an empty env", () => {
    expect(spikeConfigSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a malformed Stellar secret", () => {
    expect(spikeConfigSchema.safeParse(validEnv({ PAYER_SECRET: "not-a-secret" })).success).toBe(false);
  });

  it("accepts a fully-populated env and exposes testnet constants", () => {
    const parsed = spikeConfigSchema.safeParse(validEnv());
    expect(parsed.success).toBe(true);
    expect(TESTNET.networkPassphrase).toContain("Test SDF Network");
  });

  it("strips a trailing slash from the facilitator url", () => {
    const parsed = spikeConfigSchema.parse(validEnv({ FACILITATOR_URL: "https://facilitator.example/" }));
    expect(parsed.FACILITATOR_URL).toBe("https://facilitator.example");
  });
});
