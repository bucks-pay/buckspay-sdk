import { describe, it, expect } from "vitest";
import { Address, Keypair, Networks, StrKey, hash, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { policyAccount, resolvePolicyAccountAddress, POLICY_ACCOUNT_WASM_HASH } from "../src/policy-account/index";
import { deriveContractAddress } from "../src/oz-contract/resolveAddress";
import { spendLimit, allowlist } from "../src/policy/index";
import type { BuckspaySigner, Call, SessionGrant, SignerKey } from "@buckspay/core";

const SPONSOR_G = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));
const USDC = StrKey.encodeContract(Buffer.alloc(32, 33));
const MERCHANT = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 2));
const APP = StrKey.encodeContract(Buffer.alloc(32, 44));

function ed25519Signer(kp: Keypair): BuckspaySigner {
  return {
    type: "wallets-kit",
    async getPublicKey(): Promise<SignerKey> {
      return { type: "ed25519", publicKey: kp.publicKey() };
    },
    async signAuthEntry(p) {
      const preimage = xdr.HashIdPreimage.fromXDR(p.preimageXdr, "base64");
      return { signature: new Uint8Array(kp.sign(hash(preimage.toXDR()))), publicKey: kp.publicKey() };
    }
  };
}

const transfer = (from: string, to: string, amt: bigint): Call => ({
  contract: USDC,
  fn: "transfer",
  args: [new Address(from).toScVal(), new Address(to).toScVal(), nativeToScVal(amt, { type: "i128" })]
});

describe("@buckspay/accounts/policy-account", () => {
  it("pins the audited wasm hash", () => {
    expect(POLICY_ACCOUNT_WASM_HASH).toMatch(/^[0-9a-f]{64}$/);
  });

  it("resolveAddress is deterministic and matches the (sponsor, salt=sha256(rootPubkey), network) derivation", async () => {
    const root = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 5));
    const a = await resolvePolicyAccountAddress(ed25519Signer(root), { network: "testnet", sponsorAddress: SPONSOR_G });
    const b = await resolvePolicyAccountAddress(ed25519Signer(root), { network: "testnet", sponsorAddress: SPONSOR_G });
    expect(a).toBe(b);
    const rootHex = Buffer.from(root.rawPublicKey()).toString("hex");
    expect(a).toBe(deriveContractAddress(rootHex, SPONSOR_G, Networks.TESTNET));
  });

  it("rejects a non-ed25519 signer and a missing sponsorAddress", async () => {
    const passkeySigner = { ...ed25519Signer(Keypair.random()), async getPublicKey() { return { type: "secp256r1" as const, publicKey: "04" }; } };
    await expect(resolvePolicyAccountAddress(passkeySigner, { sponsorAddress: SPONSOR_G })).rejects.toMatchObject({ code: "INVALID_CONFIG" });
    await expect(resolvePolicyAccountAddress(ed25519Signer(Keypair.random()), {})).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });

  it("assembleSignedEntry injects a SigData scval whose ed25519 signature verifies against sha256(preimage)", async () => {
    const root = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 5));
    const acct = policyAccount({ network: "testnet", sponsorAddress: SPONSOR_G });
    const from = await acct.resolveAddress(ed25519Signer(root));
    const SIG_EXP = 1000;
    const unsigned = acct.buildUnsignedEntry({ from, call: transfer(from, MERCHANT, 50_000n), nonce: 7n });
    const signedXdr = await acct.assembleSignedEntry({
      unsigned,
      signer: ed25519Signer(root),
      signatureExpirationLedger: SIG_EXP,
      network: "testnet"
    });
    const signed = xdr.SorobanAuthorizationEntry.fromXDR(signedXdr, "base64");
    const addr = signed.credentials().address();
    expect(addr.signatureExpirationLedger()).toBe(SIG_EXP);

    const sigData = addr.signature();
    expect(sigData.switch().name).toBe("scvMap");
    const map = sigData.map()!;
    const field = (k: string) => map.find((e) => e.key().sym().toString() === k)!.val();
    expect(field("signer").bytes().equals(root.rawPublicKey())).toBe(true);
    const signature = field("signature").bytes();
    expect(signature).toHaveLength(64);

    // The signature must verify: ed25519 over sha256(the HashIDPreimage XDR).
    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId: hash(Buffer.from(Networks.TESTNET)),
        nonce: addr.nonce(),
        signatureExpirationLedger: SIG_EXP,
        invocation: signed.rootInvocation()
      })
    );
    expect(root.verify(hash(preimage.toXDR()), signature)).toBe(true);
  });

  it("builds add_signer / remove_signer session entries on the account itself", async () => {
    const root = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 5));
    const sessionG = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey();
    const acct = policyAccount({ network: "testnet", sponsorAddress: SPONSOR_G });
    const from = await acct.resolveAddress(ed25519Signer(root));
    const grant: SessionGrant = {
      sessionKey: { type: "ed25519", publicKey: sessionG },
      policies: [spendLimit({ token: USDC, max: "1000000" }), allowlist([APP])],
      expiresAt: 1_900_000_000_000
    };
    const install = acct.buildSessionInstallEntry!({ from, grant, nonce: 5n });
    const fn = install.rootInvocation().function().contractFn();
    expect(Address.fromScAddress(fn.contractAddress()).toString()).toBe(from);
    expect(fn.functionName().toString()).toBe("add_signer");

    const revoke = acct.buildSessionRevokeEntry!({ from, sessionKey: sessionG, nonce: 6n });
    expect(revoke.rootInvocation().function().contractFn().functionName().toString()).toBe("remove_signer");
  });
});
