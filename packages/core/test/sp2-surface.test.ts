import { describe, expect, it, expectTypeOf } from "vitest";
import { batch, MAX_BATCH_CALLS, BuckspayError } from "../src/index";
import type {
  GasConfig,
  FeeQuote,
  AuthDetails,
  SessionPolicy,
  SessionGrant,
  Session,
  SwapQuote,
  BuckspaySigner,
  BuckspayErrorCode,
  Call
} from "../src/index";

const call = (i: number): Call => ({ contract: "C".padEnd(56, String(i)), fn: "transfer", args: [] });

describe("SP-2 additive core surface", () => {
  it("GasConfig accepts both sponsored and token variants", () => {
    const sponsored: GasConfig = { mode: "sponsored" };
    const token: GasConfig = { mode: "token", token: "CUSDC", maxFee: "1000" };
    expect(sponsored.mode).toBe("sponsored");
    expect(token.mode).toBe("token");
  });

  it("new error codes are part of the union", () => {
    expectTypeOf<"TOKEN_GAS_REJECTED">().toMatchTypeOf<BuckspayErrorCode>();
    expectTypeOf<"BATCH_TOO_LARGE">().toMatchTypeOf<BuckspayErrorCode>();
    expectTypeOf<"SESSION_EXPIRED">().toMatchTypeOf<BuckspayErrorCode>();
    expectTypeOf<"SESSION_POLICY_VIOLATION">().toMatchTypeOf<BuckspayErrorCode>();
    expectTypeOf<"AUTH_PROVIDER_ERROR">().toMatchTypeOf<BuckspayErrorCode>();
    expectTypeOf<"SWAP_FAILED">().toMatchTypeOf<BuckspayErrorCode>();
  });

  it("BuckspaySigner.authenticate is optional (a signer without it still satisfies the type)", () => {
    const noAuth: BuckspaySigner = {
      type: "passkey",
      getPublicKey: async () => ({ type: "secp256r1", publicKey: "ab" }),
      signAuthEntry: async () => ({ signature: new Uint8Array(64), publicKey: "ab" })
    };
    expect(noAuth.authenticate).toBeUndefined();
  });

  it("standalone SP-2 types are exported and structurally usable", () => {
    const q: FeeQuote = {
      forwarder: "CFWD",
      token: "CUSDC",
      estimatedXlmFee: "100",
      tokenAmount: "5",
      expiresAtLedger: 1
    };
    const a: AuthDetails = { publicKey: "GABC", provider: "web3auth" };
    const p: SessionPolicy = { kind: "allowlist", contracts: ["CAPP"] };
    const g: SessionGrant = {
      sessionKey: { type: "ed25519", publicKey: "GKEY" },
      policies: [p],
      expiresAt: 1
    };
    const s: Session = { id: "x", account: "CACC", sessionKey: "GKEY", policies: [p], expiresAt: 1 };
    const sw: SwapQuote = { tokenIn: "CA", tokenOut: "CB", amountIn: "1", amountOut: "2" };
    expect([q.forwarder, a.provider, g.expiresAt, s.id, sw.amountOut]).toBeTruthy();
  });

  it("batch() collects calls and enforces MAX_BATCH_CALLS", () => {
    const b = batch(call(1), call(2));
    expect(b.size()).toBe(2);
    expect(b.add(call(3)).build()).toHaveLength(3);
    expect(MAX_BATCH_CALLS).toBe(16);
  });

  it("batch() throws BATCH_TOO_LARGE over the cap", () => {
    const b = batch();
    for (let i = 0; i < MAX_BATCH_CALLS + 1; i++) b.add(call(i));
    try {
      b.build();
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BuckspayError);
      expect((e as BuckspayError).code).toBe("BATCH_TOO_LARGE");
    }
  });
});
