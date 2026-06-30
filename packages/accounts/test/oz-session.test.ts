import { describe, it, expect } from "vitest";
import { Address, Keypair, StrKey, xdr } from "@stellar/stellar-sdk";
import { ozContractAccount } from "../src/oz-contract/index";
import { spendLimit, allowlist } from "../src/policy/index";
import type { SessionGrant } from "@buckspay/core";

const ACCOUNT_C = StrKey.encodeContract(Buffer.alloc(32, 7));
const SESSION_G = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey();
const USDC = StrKey.encodeContract(Buffer.alloc(32, 33));
const APP = StrKey.encodeContract(Buffer.alloc(32, 44));

function invocation(e: xdr.SorobanAuthorizationEntry): xdr.InvokeContractArgs {
  return e.rootInvocation().function().contractFn();
}

describe("oz-contract session entries (add_signer / remove_signer)", () => {
  const acct = ozContractAccount({ network: "testnet" });
  const grant: SessionGrant = {
    sessionKey: { type: "ed25519", publicKey: SESSION_G },
    policies: [spendLimit({ token: USDC, max: "1000000" }), allowlist([APP])],
    expiresAt: 1_900_000_000_000
  };

  it("buildSessionInstallEntry targets the account contract with add_signer + [BytesN(key), Policy]", () => {
    const e = acct.buildSessionInstallEntry!({ from: ACCOUNT_C, grant, nonce: 5n });
    const fn = invocation(e);
    expect(Address.fromScAddress(fn.contractAddress()).toString()).toBe(ACCOUNT_C); // self-administration
    expect(fn.functionName().toString()).toBe("add_signer");
    expect(fn.args()).toHaveLength(2);
    expect(fn.args()[0]!.switch().name).toBe("scvBytes");
    expect(StrKey.encodeEd25519PublicKey(fn.args()[0]!.bytes())).toBe(SESSION_G);
    expect(fn.args()[1]!.switch().name).toBe("scvMap"); // the compiled Policy struct
    expect(e.credentials().switch().name).toBe("sorobanCredentialsAddress");
  });

  it("buildSessionRevokeEntry targets remove_signer with the session key", () => {
    const e = acct.buildSessionRevokeEntry!({ from: ACCOUNT_C, sessionKey: SESSION_G, nonce: 6n });
    const fn = invocation(e);
    expect(fn.functionName().toString()).toBe("remove_signer");
    expect(fn.args()).toHaveLength(1);
    expect(StrKey.encodeEd25519PublicKey(fn.args()[0]!.bytes())).toBe(SESSION_G);
  });
});
