import { describe, it, expect } from "vitest";
import { nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { formatCheckAuthSignature, decodeCheckAuthSignature } from "../../src/passkey/signAuthEntry.js";

/**
 * EXACT replica of `spikes/passkey-contract/src/check-auth.ts` `assembleWebAuthnSigData`
 * — the scval the OZ Smart Account `__check_auth` accepted ON-CHAIN (DECISION.md = GO).
 * If `formatCheckAuthSignature` diverges by even a byte, the contract rejects the signature.
 */
function spikeAssembleWebAuthnSigData(a: {
  authenticatorData: Uint8Array;
  clientData: Uint8Array;
  signature64: Uint8Array;
}): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: nativeToScVal("authenticator_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(a.authenticatorData))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("client_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(a.clientData))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("signature", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(a.signature64))
    })
  ]);
}

describe("__check_auth signature byte-parity with the on-chain-validated spike", () => {
  const authenticatorData = new Uint8Array(37).fill(0xab);
  const clientData = new TextEncoder().encode(
    '{"type":"webauthn.get","challenge":"abc","origin":"https://buckspay.dev"}'
  );
  const signature = new Uint8Array(64).fill(0xcd);

  it("formatCheckAuthSignature emits the exact spike scval (byte-identical XDR)", () => {
    const mine = formatCheckAuthSignature({ authenticatorData, clientDataJSON: clientData, signature });
    const spike = spikeAssembleWebAuthnSigData({ authenticatorData, clientData, signature64: signature });
    expect(Buffer.from(mine.toXDR())).toEqual(Buffer.from(spike.toXDR()));
  });

  it("decode round-trips the spike field names (authenticator_data, client_data, signature)", () => {
    const scval = formatCheckAuthSignature({ authenticatorData, clientDataJSON: clientData, signature });
    const parts = decodeCheckAuthSignature(scval.toXDR());
    expect(Buffer.from(parts.authenticatorData)).toEqual(Buffer.from(authenticatorData));
    expect(Buffer.from(parts.clientDataJSON)).toEqual(Buffer.from(clientData));
    expect(Buffer.from(parts.signature)).toEqual(Buffer.from(signature));
  });

  it("rejects a non-64-byte signature (would fail secp256r1_verify on-chain)", () => {
    expect(() =>
      formatCheckAuthSignature({ authenticatorData, clientDataJSON: clientData, signature: new Uint8Array(63) })
    ).toThrow(/64 bytes/);
  });
});
