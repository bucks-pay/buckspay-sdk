import { Keypair } from "@stellar/stellar-sdk";
import type { SocialProvider } from "../../src/social/index.js";

/** Deterministic G-address for the happy-path double. */
export const FAKE_SOCIAL_G = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey();

/** A SocialProvider double that connects to a fixed key and returns a fixed 64-byte signature. */
export function fakeSocialProvider(over: Partial<SocialProvider> = {}): SocialProvider {
  return {
    connect: async () => ({ publicKey: FAKE_SOCIAL_G, expiresAt: 1_900_000_000_000 }),
    signDigest: async () => new Uint8Array(64).map((_, i) => (i * 5 + 1) & 0xff),
    ...over
  };
}

/** A SocialProvider double whose connect() rejects (provider/OAuth failure). */
export function failingSocialProvider(): SocialProvider {
  return {
    connect: async () => {
      throw new Error("web3auth: popup closed by user");
    },
    signDigest: async () => new Uint8Array(64)
  };
}
