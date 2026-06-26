import { describe, expect, it } from "vitest";
import { GasAbstractionEngine } from "../src/gas-abstraction-engine";
import type { RelayPayload, SignedIntent } from "../src/types";

const signed: SignedIntent = {
  from: "GAAAA...FROM",
  to: "GBBBB...TO",
  token: "CCCCC...SAC",
  value: "15000000",
  nonce: "42",
  signatureExpirationLedger: 1000060,
  network: "testnet",
  authorizationEntryXdr: "AAAAbase64SignedEntry=="
};

describe("toRelayPayload (sponsored)", () => {
  const engine = new GasAbstractionEngine({ mode: "sponsored" });

  it("projects exactly the seven facilitator fields", () => {
    const payload = engine.toRelayPayload(signed);
    expect(payload).toEqual<RelayPayload>({
      token: "CCCCC...SAC",
      from: "GAAAA...FROM",
      to: "GBBBB...TO",
      value: "15000000",
      authorizationEntryXdr: "AAAAbase64SignedEntry==",
      nonce: "42",
      signatureExpirationLedger: 1000060
    });
  });

  it("does NOT leak intent-only fields (network) into the payload", () => {
    const payload = engine.toRelayPayload(signed) as unknown as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ["authorizationEntryXdr", "from", "nonce", "signatureExpirationLedger", "to", "token", "value"].sort()
    );
    expect(payload).not.toHaveProperty("network");
  });

  it("preserves value/nonce as decimal strings (no Number coercion)", () => {
    const big: SignedIntent = { ...signed, value: "9007199254740993", nonce: "4503599627370495" };
    const payload = engine.toRelayPayload(big);
    expect(payload.value).toBe("9007199254740993");
    expect(payload.nonce).toBe("4503599627370495");
  });
});
