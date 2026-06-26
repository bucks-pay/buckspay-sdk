import { describe, it, expect } from "vitest";
import { Keypair, Networks, xdr } from "@stellar/stellar-sdk";
import { relayPayloadSchema, signTransferAuthLocal } from "./sign-local.js";

const SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const TO = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

describe("local ed25519 signer stand-in", () => {
  it("produces a RelayPayload whose signed auth entry decodes and carries a 64-byte ed25519 signature", async () => {
    const payer = Keypair.random();
    const payload = await signTransferAuthLocal({
      payer,
      networkPassphrase: Networks.TESTNET,
      sac: SAC,
      to: TO,
      stroops: 10000000n,
      nonce: 7n,
      signatureExpirationLedger: 999_999_999
    });

    const parsed = relayPayloadSchema.parse(payload);
    expect(parsed.from).toBe(payer.publicKey());
    expect(parsed.to).toBe(TO);
    expect(parsed.token).toBe(SAC);
    expect(parsed.value).toBe("10000000");
    expect(parsed.nonce).toBe("7");

    const entry = xdr.SorobanAuthorizationEntry.fromXDR(parsed.authorizationEntryXdr, "base64");
    const creds = entry.credentials().address();
    expect(creds.signatureExpirationLedger()).toBe(999_999_999);
    // signature is non-void once signed
    expect(creds.signature().switch().name).not.toBe("scvVoid");
  });
});
