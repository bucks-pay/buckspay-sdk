import { describe, it, expect } from "vitest";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import { BuckspayClient, type AccountSimContext } from "../src/client";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import type {
  AccountAdapter,
  BuckspayConfig,
  BuckspaySigner,
  Receipt,
  RelayPayload,
  SessionGrant,
  SignerKey
} from "../src/types";

const ACCOUNT_C = StrKey.encodeContract(Buffer.alloc(32, 7));
const SESSION_KP = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9));
const USDC = StrKey.encodeContract(Buffer.alloc(32, 33));
const APP = StrKey.encodeContract(Buffer.alloc(32, 44));
const NOW = 1_800_000_000_000;
const RECEIPT: Receipt = {
  ok: true,
  via: "buckspay_self",
  token: USDC,
  chain: "stellar-testnet",
  transferTx: "f".repeat(64),
  ledger: 1000,
  status: "success"
};

function relayerSpy() {
  const calls: RelayPayload[] = [];
  return {
    calls,
    relayer: {
      async relay(p: RelayPayload): Promise<Receipt> {
        calls.push(p);
        return RECEIPT;
      },
      async getAccountState() {
        return { exists: true, hasUsdcTrustline: true };
      },
      async buildOnboard() {
        return { xdr: "" };
      },
      async submitOnboard() {
        return { ok: true };
      },
      async deployContract() {
        return { address: ACCOUNT_C };
      }
    }
  } as const;
}

function passkeyRoot(): BuckspaySigner & { signCalls: number } {
  const s = {
    type: "passkey" as const,
    signCalls: 0,
    async getPublicKey(): Promise<SignerKey> {
      return { type: "secp256r1", publicKey: "04" + "ab".repeat(64) };
    },
    async signAuthEntry() {
      s.signCalls += 1;
      return { signature: new Uint8Array(64), publicKey: "04" };
    }
  };
  return s;
}

function makeAdapter(model: "contract" | "classic"): AccountAdapter {
  const stub = (nonce: bigint) =>
    buildUnsignedEntry({ sac: ACCOUNT_C, from: ACCOUNT_C, to: SESSION_KP.publicKey(), stroops: 1n, nonce });
  const adapter: AccountAdapter = {
    model,
    async resolveAddress() {
      return ACCOUNT_C;
    },
    async ensureReady() {},
    buildUnsignedEntry: (i) => stub(i.nonce),
    buildUnsignedBatchEntry: (i) => stub(i.nonce),
    async assembleSignedEntry(i) {
      await i.signer.signAuthEntry({
        preimageXdr: "AAAA",
        network: i.network,
        signatureExpirationLedger: i.signatureExpirationLedger
      });
      return `signed:${i.unsigned.toXDR("base64")}`;
    }
  };
  // Only the contract model carries the session methods (the classic model omits them).
  if (model === "contract") {
    adapter.buildSessionInstallEntry = (i) => stub(i.nonce);
    adapter.buildSessionRevokeEntry = (i) => stub(i.nonce);
  }
  return adapter;
}

const sim: AccountSimContext = {
  simulator: { async simulate() {} } as never,
  getLatestLedger: async () => 5000,
  randomNonce: () => 42n
};

function client(model: "contract" | "classic") {
  const { relayer, calls } = relayerSpy();
  const signer = passkeyRoot();
  const account = makeAdapter(model);
  const config: BuckspayConfig = { network: "testnet", account, signer, relayer, gas: { mode: "sponsored" } };
  return { c: new BuckspayClient(config, sim, { now: () => NOW }), calls, signer };
}

const grant = (policies: SessionGrant["policies"]): SessionGrant => ({
  sessionKey: { type: "ed25519", publicKey: SESSION_KP.publicKey() },
  policies,
  expiresAt: NOW + 86_400_000
});

describe("SessionManager via BuckspayClient (contract-only)", () => {
  it("grantSession throws INVALID_CONFIG on the classic model", async () => {
    const { c } = client("classic");
    await c.connect();
    await expect(c.grantSession(grant([{ kind: "allowlist", contracts: [APP] }]))).rejects.toMatchObject({
      code: "INVALID_CONFIG"
    });
  });

  it("grantSession refuses an empty policy set", async () => {
    const { c } = client("contract");
    await c.connect();
    await expect(c.grantSession(grant([]))).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });

  it("grantSession signs with the ROOT signer and relays a sessionOp:install payload", async () => {
    const { c, calls, signer } = client("contract");
    await c.connect();
    const { session, receipt } = await c.grantSession(
      grant([{ kind: "spendLimit", token: USDC, max: "1000000", period: "day" }, { kind: "allowlist", contracts: [APP] }])
    );
    expect(signer.signCalls).toBe(1);
    expect(receipt.ok).toBe(true);
    expect(session.account).toBe(ACCOUNT_C);
    expect(session.sessionKey).toBe(SESSION_KP.publicKey());
    expect(calls).toHaveLength(1);
    expect(calls[0]!.sessionOp).toBe("install");
    expect(calls[0]!.from).toBe(ACCOUNT_C);
  });

  it("revokeSession(session) relays a sessionOp:revoke payload", async () => {
    const { c, calls } = client("contract");
    await c.connect();
    const { session } = await c.grantSession(grant([{ kind: "allowlist", contracts: [APP] }]));
    const receipt = await c.revokeSession(session);
    expect(receipt.ok).toBe(true);
    expect(calls.at(-1)!.sessionOp).toBe("revoke");
  });

  it("revokeSession(id) resolves a previously-granted session; unknown id → INVALID_CONFIG", async () => {
    const { c } = client("contract");
    await c.connect();
    const { session } = await c.grantSession(grant([{ kind: "allowlist", contracts: [APP] }]));
    await expect(c.revokeSession(session.id)).resolves.toMatchObject({ ok: true });
    await expect(c.revokeSession("deadbeef")).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });
});
