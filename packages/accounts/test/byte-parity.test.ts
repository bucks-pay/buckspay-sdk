import { describe, it, expect } from "vitest";
import {
  Address,
  authorizeEntry,
  hash,
  Keypair,
  nativeToScVal,
  Networks,
  StrKey,
  xdr,
  type SigningCallback
} from "@stellar/stellar-sdk";
import { GasAbstractionEngine } from "@buckspay/core";
import type { BuckspaySigner, Call, SignedIntent } from "@buckspay/core";
import { classicAccount } from "../src/classic/classic-account.js";

/**
 * BYTE-PARITY INVARIANT (README §5).
 *
 * The `RelayPayload` the SDK's classic path produces MUST be byte-identical to
 * today's `SorobanRelayBody` from the dashboard's `signTransferAuth`
 * (`buckspay_dashboard_front/apps/web/src/web3-stellar/sign.ts`).
 *
 * This test pins that without needing the dashboard at runtime: the REFERENCE is
 * the dashboard recipe inlined verbatim (an INDEPENDENT impl — if the SDK's
 * builder/adapter ever drifts, this fails), and the ACTUAL is the SDK classic
 * path (classicAccount.buildUnsignedEntry → assembleSignedEntry → engine.toRelayPayload).
 * ed25519 signatures are deterministic (RFC 8032), so with fixed inputs the signed
 * XDR is reproducible and comparable byte-for-byte.
 */

// ── Fixed, deterministic inputs ─────────────────────────────────────────────
const kp = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7));
const FROM = kp.publicKey();
const TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey();
const SAC = StrKey.encodeContract(Buffer.alloc(32, 33));
const STROOPS = 15_000_000n; // "1.5" USDC (7 decimals)
const NONCE = 1234567890n;
const EXPIRY = 5_000_000;

// ── REFERENCE: dashboard web3-stellar/sign.ts, inlined verbatim ─────────────
function dashboardBuildUnsignedEntry(p: {
  sac: string;
  from: string;
  to: string;
  stroops: bigint;
  nonce: bigint;
}): xdr.SorobanAuthorizationEntry {
  const args = [
    new Address(p.from).toScVal(),
    new Address(p.to).toScVal(),
    nativeToScVal(p.stroops, { type: "i128" })
  ];
  const contractScAddress = Address.contract(StrKey.decodeContract(p.sac)).toScAddress();
  const contractFn = new xdr.InvokeContractArgs({
    contractAddress: contractScAddress,
    functionName: "transfer",
    args
  });
  const invocation = new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(contractFn),
    subInvocations: []
  });
  const credentials = new xdr.SorobanAddressCredentials({
    address: new Address(p.from).toScAddress(),
    nonce: xdr.Int64.fromString(p.nonce.toString()),
    signatureExpirationLedger: 0,
    signature: xdr.ScVal.scvVoid()
  });
  return new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(credentials),
    rootInvocation: invocation
  });
}

async function dashboardSignTransferAuth(): Promise<{
  token: string;
  from: string;
  to: string;
  value: string;
  authorizationEntryXdr: string;
  nonce: string;
  signatureExpirationLedger: number;
}> {
  const unsigned = dashboardBuildUnsignedEntry({
    sac: SAC,
    from: FROM,
    to: TO,
    stroops: STROOPS,
    nonce: NONCE
  });
  // Async to match SigningCallback + the dashboard's real wallet-backed signer.
  // eslint-disable-next-line @typescript-eslint/require-await
  const signer: SigningCallback = async (preimage) => {
    const sig = new Uint8Array(kp.sign(hash(preimage.toXDR())));
    if (sig.length !== 64) throw new Error(`unexpected signature length ${String(sig.length)}`);
    return { signature: Buffer.from(sig), publicKey: FROM };
  };
  const signed = await authorizeEntry(unsigned, signer, EXPIRY, Networks.TESTNET);
  return {
    token: SAC,
    from: FROM,
    to: TO,
    value: STROOPS.toString(),
    authorizationEntryXdr: signed.toXDR("base64"),
    nonce: NONCE.toString(),
    signatureExpirationLedger: EXPIRY
  };
}

// ── ACTUAL: the SDK classic path ────────────────────────────────────────────
function sdkSigner(): BuckspaySigner {
  return {
    type: "wallets-kit",
    getPublicKey: () => Promise.resolve({ type: "ed25519", publicKey: FROM }),
    signAuthEntry: (payload) => {
      const preimage = xdr.HashIdPreimage.fromXDR(payload.preimageXdr, "base64");
      const signature = new Uint8Array(kp.sign(hash(preimage.toXDR())));
      return Promise.resolve({ signature, publicKey: FROM });
    }
  };
}

async function sdkRelayPayload() {
  const account = classicAccount();
  const call: Call = {
    contract: SAC,
    fn: "transfer",
    args: [
      new Address(FROM).toScVal(),
      new Address(TO).toScVal(),
      nativeToScVal(STROOPS, { type: "i128" })
    ]
  };
  const unsigned = account.buildUnsignedEntry({ from: FROM, call, nonce: NONCE });
  const authorizationEntryXdr = await account.assembleSignedEntry({
    unsigned,
    signer: sdkSigner(),
    signatureExpirationLedger: EXPIRY,
    network: "testnet"
  });
  const signed: SignedIntent = {
    from: FROM,
    to: TO,
    token: SAC,
    value: STROOPS.toString(),
    nonce: NONCE.toString(),
    signatureExpirationLedger: EXPIRY,
    network: "testnet",
    authorizationEntryXdr
  };
  const engine = new GasAbstractionEngine({ mode: "sponsored" });
  return { unsigned, payload: engine.toRelayPayload(signed) };
}

describe("classic path byte-parity vs dashboard signTransferAuth (README §5)", () => {
  it("builds a byte-identical UNSIGNED auth entry (core builder == dashboard builder)", () => {
    const sdkUnsigned = classicAccount()
      .buildUnsignedEntry({
        from: FROM,
        call: {
          contract: SAC,
          fn: "transfer",
          args: [
            new Address(FROM).toScVal(),
            new Address(TO).toScVal(),
            nativeToScVal(STROOPS, { type: "i128" })
          ]
        },
        nonce: NONCE
      })
      .toXDR("base64");
    const refUnsigned = dashboardBuildUnsignedEntry({
      sac: SAC,
      from: FROM,
      to: TO,
      stroops: STROOPS,
      nonce: NONCE
    }).toXDR("base64");
    expect(sdkUnsigned).toBe(refUnsigned);
  });

  it("produces a byte-identical SIGNED authorizationEntryXdr", async () => {
    const ref = await dashboardSignTransferAuth();
    const { payload } = await sdkRelayPayload();
    expect(payload.authorizationEntryXdr).toBe(ref.authorizationEntryXdr);
  });

  it("produces a RelayPayload byte-identical to the dashboard SorobanRelayBody", async () => {
    const ref = await dashboardSignTransferAuth();
    const { payload } = await sdkRelayPayload();
    expect(payload).toEqual(ref);
    // Exact shape (no network leak, contract field order).
    expect(Object.keys(payload)).toEqual([
      "token",
      "from",
      "to",
      "value",
      "authorizationEntryXdr",
      "nonce",
      "signatureExpirationLedger"
    ]);
  });
});
