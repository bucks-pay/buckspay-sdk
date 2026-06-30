import { describe, it, expect, expectTypeOf } from "vitest";
import type { SignerType, BuckspaySigner } from "../src/index";

describe("SignerType widening for social/email signers", () => {
  it("'social' and 'email' are members of SignerType", () => {
    expectTypeOf<"social">().toMatchTypeOf<SignerType>();
    expectTypeOf<"email">().toMatchTypeOf<SignerType>();
  });

  it("a signer may declare type 'social' and still satisfy BuckspaySigner", () => {
    const s: BuckspaySigner = {
      type: "social",
      getPublicKey: async () => ({ type: "ed25519", publicKey: "GABC" }),
      signAuthEntry: async () => ({ signature: new Uint8Array(64), publicKey: "GABC" }),
      authenticate: async () => ({ publicKey: "GABC", provider: "web3auth" })
    };
    expect(s.type).toBe("social");
  });
});
