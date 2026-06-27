import { describe, it, expect, vi } from "vitest";
import { Address, hash, Keypair, StrKey, xdr } from "@stellar/stellar-sdk";
import { buildUnsignedEntry, createBuckspayClient, createRpcSimContext } from "@buckspay/core";
import type { BuckspaySigner, Relayer, RpcFetch } from "@buckspay/core";
import { classicAccount } from "../src/classic/classic-account.js";

/**
 * End-to-end proof that the SDK's flagship `connect → prepare → sign` runs with
 * the REAL RPC sim context (`createRpcSimContext`) — the path the dashboard
 * dogfood uses. fetch is mocked to answer both `getLatestLedger` and
 * `simulateTransaction` on the same RPC url; the signer uses a local keypair so
 * the signature is deterministic.
 */
const kp = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 3));
const FROM = kp.publicKey();
const TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4)).publicKey();
const SAC = StrKey.encodeContract(Buffer.alloc(32, 33));

// A real recorded auth entry for the sim response (simulateRecording decodes it).
const recordedEntry = buildUnsignedEntry({
  sac: SAC,
  from: FROM,
  to: TO,
  stroops: 15_000_000n,
  nonce: 1n
}).toXDR("base64");

function signer(): BuckspaySigner {
  return {
    type: "wallets-kit",
    getPublicKey: () => Promise.resolve({ type: "ed25519", publicKey: FROM }),
    signAuthEntry: (payload) => {
      const preimage = xdr.HashIdPreimage.fromXDR(payload.preimageXdr, "base64");
      return Promise.resolve({ signature: new Uint8Array(kp.sign(hash(preimage.toXDR()))), publicKey: FROM });
    }
  };
}

function readyRelayer(): Relayer {
  return {
    relay: vi.fn(),
    getAccountState: vi.fn(async () => ({ exists: true, hasUsdcTrustline: true })),
    buildOnboard: vi.fn(),
    submitOnboard: vi.fn(),
    deployContract: vi.fn()
  } as unknown as Relayer;
}

function jsonRpc(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}

function rpcFetch(): RpcFetch {
  return vi.fn(async (_url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string) as { method: string };
    if (body.method === "getLatestLedger") {
      return jsonRpc({ jsonrpc: "2.0", id: 1, result: { sequence: 1_000_000 } });
    }
    if (body.method === "simulateTransaction") {
      return jsonRpc({
        jsonrpc: "2.0",
        id: 1,
        result: { minResourceFee: "100", results: [{ auth: [recordedEntry] }] }
      });
    }
    return jsonRpc({ jsonrpc: "2.0", id: 1, error: { code: -1, message: "unexpected method" } });
  });
}

describe("BuckspayClient + real RPC sim context (end-to-end prepare→sign)", () => {
  it("connect → prepare → sign produces a signed SorobanAuthorizationEntry", async () => {
    const sim = createRpcSimContext("https://rpc.test", { fetchImpl: rpcFetch(), randomNonce: () => 7n });
    const client = createBuckspayClient(
      {
        network: "testnet",
        account: classicAccount(),
        signer: signer(),
        relayer: readyRelayer(),
        gas: { mode: "sponsored" }
      },
      sim
    );

    await client.connect();
    const call = client.transfer({ token: SAC, to: TO, amount: 15_000_000n });
    const intent = await client.prepare([call]);

    expect(intent.from).toBe(FROM);
    expect(intent.to).toBe(TO);
    expect(intent.value).toBe("15000000");
    expect(intent.nonce).toBe("7");
    expect(intent.signatureExpirationLedger).toBe(1_000_060); // latestLedger + 60

    const signed = await client.sign(intent);
    expect(typeof signed.authorizationEntryXdr).toBe("string");
    const back = xdr.SorobanAuthorizationEntry.fromXDR(signed.authorizationEntryXdr, "base64");
    expect(back.credentials().switch().name).toBe("sorobanCredentialsAddress");
    expect(Address.fromScAddress(back.credentials().address().address()).toString()).toBe(FROM);
  });

  it("a reverting simulation surfaces SIMULATION_FAILED from prepare", async () => {
    const fetchImpl: RpcFetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as { method: string };
      if (body.method === "getLatestLedger") {
        return jsonRpc({ jsonrpc: "2.0", id: 1, result: { sequence: 1_000_000 } });
      }
      return jsonRpc({ jsonrpc: "2.0", id: 1, result: { error: "HostError: balance too low" } });
    });
    const client = createBuckspayClient(
      {
        network: "testnet",
        account: classicAccount(),
        signer: signer(),
        relayer: readyRelayer(),
        gas: { mode: "sponsored" }
      },
      createRpcSimContext("https://rpc.test", { fetchImpl, randomNonce: () => 7n })
    );
    await client.connect();
    const call = client.transfer({ token: SAC, to: TO, amount: 15_000_000n });
    await expect(client.prepare([call])).rejects.toMatchObject({ code: "SIMULATION_FAILED" });
  });
});
