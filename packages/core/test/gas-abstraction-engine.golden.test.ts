import { describe, expect, it } from "vitest";
import golden from "./fixtures/soroban-relay-body.golden.json";
import { GasAbstractionEngine } from "../src/gas-abstraction-engine";
import type { SignedIntent } from "../src/types";

// The dashboard's SorobanRelayBody, reconstructed as a SignedIntent. The engine
// must reproduce `golden` exactly (parity invariant for the dashboard migration).
const signed: SignedIntent = {
  token: golden.token,
  from: golden.from,
  to: golden.to,
  value: golden.value,
  authorizationEntryXdr: golden.authorizationEntryXdr,
  nonce: golden.nonce,
  signatureExpirationLedger: golden.signatureExpirationLedger,
  network: "testnet" // intent-only; must NOT appear in the payload
};

describe("GOLDEN: engine RelayPayload == dashboard SorobanRelayBody", () => {
  const engine = new GasAbstractionEngine({ mode: "sponsored" });
  const payload = engine.toRelayPayload(signed);

  it("is deep-equal to the dashboard golden body", () => {
    expect(payload).toEqual(golden);
  });

  it("has the identical key set (no extra, no missing)", () => {
    expect(Object.keys(payload).sort()).toEqual(Object.keys(golden).sort());
  });

  it("serializes byte-identically when keys are sorted (transport parity)", () => {
    const canon = (o: Record<string, unknown>) => JSON.stringify(o, Object.keys(o).sort());
    expect(canon(payload as unknown as Record<string, unknown>)).toBe(
      canon(golden as unknown as Record<string, unknown>)
    );
  });

  it("matches each field type the facilitator stellarSorobanSchema requires", () => {
    expect(typeof payload.token).toBe("string");
    expect(typeof payload.from).toBe("string");
    expect(typeof payload.to).toBe("string");
    expect(typeof payload.value).toBe("string");
    expect(typeof payload.authorizationEntryXdr).toBe("string");
    expect(typeof payload.nonce).toBe("string");
    expect(typeof payload.signatureExpirationLedger).toBe("number");
  });
});
