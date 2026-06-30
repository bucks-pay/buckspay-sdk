import { describe, expect, it } from "vitest";
import { GasAbstractionEngine } from "../src/gas-abstraction-engine";
import type { SignedIntent } from "../src/types";

const base: SignedIntent = {
  token: "C".padEnd(56, "A"),
  from: "G".padEnd(56, "B"),
  to: "G".padEnd(56, "C"),
  value: "100000",
  nonce: "7",
  signatureExpirationLedger: 1_000_060,
  network: "testnet",
  authorizationEntryXdr: "AAAA"
};

describe("GasAbstractionEngine.toRelayPayload — feeToken", () => {
  const engine = new GasAbstractionEngine({ mode: "token", token: base.token });

  it("carries feeToken through when present (token mode)", () => {
    const payload = engine.toRelayPayload({ ...base, feeToken: base.token });
    expect(payload.feeToken).toBe(base.token);
  });

  it("omits feeToken when absent → the seven-field SP-1 body (sponsored parity)", () => {
    const payload = engine.toRelayPayload(base);
    expect("feeToken" in payload).toBe(false);
    expect(Object.keys(payload).sort()).toEqual(
      ["authorizationEntryXdr", "from", "nonce", "signatureExpirationLedger", "to", "token", "value"].sort()
    );
  });
});
