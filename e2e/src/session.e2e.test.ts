import { describe, it, expect } from "vitest";
import {
  Address,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  hash,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr
} from "@stellar/stellar-sdk";
import type { AccountAdapter, BuckspaySigner, Relayer, SessionGrant, SignerKey } from "@buckspay/core";
import { spendLimit, allowlist } from "@buckspay/accounts/policy";
import { buildSessionClient } from "./harness.js";
import { E2E_ENABLED, e2eEnv } from "./env.js";

const READY =
  E2E_ENABLED &&
  !!e2eEnv.FACILITATOR_API_KEY &&
  !!e2eEnv.E2E_SPONSOR_G &&
  !!e2eEnv.E2E_USDC_TESTNET_SAC &&
  !!e2eEnv.E2E_MERCHANT_G &&
  !!e2eEnv.E2E_PAYER_SECRET;

/** A software ed25519 signer (root or session key) that signs the auth-entry preimage on-chain-style. */
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

/** Random positive i64 nonce (56 bits, never negative). */
function randomNonce(): bigint {
  const b = Buffer.from(crypto.getRandomValues(new Uint8Array(7)));
  return BigInt(`0x${b.toString("hex")}`);
}

function server(): rpc.Server {
  return new rpc.Server(e2eEnv.SOROBAN_RPC_URL, { allowHttp: e2eEnv.SOROBAN_RPC_URL.startsWith("http://") });
}

/** Read an address' USDC SAC balance (stroops) by simulating the SAC's `balance(addr)`. */
async function sacBalance(addr: string): Promise<bigint> {
  const srv = server();
  const sac = new Contract(e2eEnv.E2E_USDC_TESTNET_SAC!);
  const source = await srv.getAccount(e2eEnv.E2E_SPONSOR_G!);
  const tx = new TransactionBuilder(source, { fee: "100", networkPassphrase: Networks.TESTNET })
    .addOperation(sac.call("balance", new Address(addr).toScVal()))
    .setTimeout(30)
    .build();
  const sim = await srv.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim) || !sim.result?.retval) return 0n;
  return BigInt(scValToNative(sim.result.retval) as bigint);
}

/** Fund a freshly-deployed C-account with USDC via a SAC transfer signed by the payer. */
async function fundWithUsdc(to: string, stroops: bigint): Promise<void> {
  const kp = Keypair.fromSecret(e2eEnv.E2E_PAYER_SECRET!);
  const srv = server();
  const source = await srv.getAccount(kp.publicKey());
  const sac = new Contract(e2eEnv.E2E_USDC_TESTNET_SAC!);
  const tx = new TransactionBuilder(source, { fee: "1000000", networkPassphrase: Networks.TESTNET })
    .addOperation(
      sac.call(
        "transfer",
        new Address(kp.publicKey()).toScVal(),
        new Address(to).toScVal(),
        nativeToScVal(stroops, { type: "i128" })
      )
    )
    .setTimeout(60)
    .build();
  const prepared = await srv.prepareTransaction(tx);
  prepared.sign(kp);
  const sent = await srv.sendTransaction(prepared);
  let confirmed = false;
  for (let i = 0; i < 30 && !confirmed; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const got = await srv.getTransaction(sent.hash);
    if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) confirmed = true;
    if (got.status === rpc.Api.GetTransactionStatus.FAILED) throw new Error(`fund tx ${sent.hash} failed`);
  }
  if (!confirmed) throw new Error(`fund tx ${sent.hash} not confirmed`);
  // The SAC balance the facilitator's sim reads is indexed with a lag — poll until it's visible.
  for (let i = 0; i < 15; i++) {
    if ((await sacBalance(to)) >= stroops) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`fund balance not visible for ${to} after polling`);
}

/**
 * Pay a USDC transfer FROM the policy account, signed by the SESSION key. The account address is fixed
 * (root-derived), but the SESSION key signs the entry — the account's `__check_auth` looks up the
 * session's policy and enforces it on-chain. Built directly against the adapter (a session pays from the
 * account, not from the signer's own derived address) and relayed straight through the facilitator.
 */
async function paySessionTransfer(args: {
  account: AccountAdapter;
  accountAddr: string;
  sessionSigner: BuckspaySigner;
  relayer: Relayer;
  to: string;
  amount: bigint;
}) {
  const { account, accountAddr, sessionSigner, relayer, to, amount } = args;
  const token = e2eEnv.E2E_USDC_TESTNET_SAC!;
  const nonce = randomNonce();
  const call = {
    contract: token,
    fn: "transfer",
    args: [new Address(accountAddr).toScVal(), new Address(to).toScVal(), nativeToScVal(amount, { type: "i128" })]
  };
  const unsigned = account.buildUnsignedEntry({ from: accountAddr, call, nonce });
  const latest = await server().getLatestLedger();
  const signatureExpirationLedger = latest.sequence + 60;
  const authorizationEntryXdr = await account.assembleSignedEntry({
    unsigned,
    signer: sessionSigner,
    signatureExpirationLedger,
    network: "testnet"
  });
  return relayer.relay({
    token,
    from: accountAddr,
    to,
    value: amount.toString(),
    authorizationEntryXdr,
    nonce: nonce.toString(),
    signatureExpirationLedger
  });
}

describe.skipIf(!READY)("policy session-account (testnet): grant → session pay → over-limit → revoke", () => {
  it("runs the full session lifecycle on-chain", async () => {
    const root = Keypair.random();
    const sessionKp = Keypair.random();
    const { client, relayer, account } = buildSessionClient(ed25519Signer(root));
    const MERCHANT = e2eEnv.E2E_MERCHANT_G!;

    // 1. connect() deploys the sponsored policy account bound to the root key.
    const wallet = await client.connect();
    expect(wallet.model).toBe("contract");
    expect(wallet.address).toMatch(/^C[A-Z2-7]{55}$/);
    const accountAddr = wallet.address;

    // connect() waited for the deploy, but a separate getState() can hit a lagging public-RPC node.
    let state = await wallet.getState();
    for (let i = 0; i < 15 && !state.exists; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      state = await wallet.getState();
    }
    expect(state.exists).toBe(true);

    // 2. Fund the account with 0.5 USDC so the session payment can settle.
    await fundWithUsdc(accountAddr, 5_000_000n);

    // 3. Grant a session: 0.1 USDC/day spend cap + allow-list [USDC SAC]. Root-signed.
    const grant: SessionGrant = {
      sessionKey: { type: "ed25519", publicKey: sessionKp.publicKey() },
      policies: [spendLimit({ token: e2eEnv.E2E_USDC_TESTNET_SAC!, max: "1000000" }), allowlist([e2eEnv.E2E_USDC_TESTNET_SAC!])],
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    const { session: granted, receipt: grantReceipt } = await client.grantSession(grant);
    expect(grantReceipt.ok).toBe(true);

    // 4. HERO: the SESSION key pays 0.05 USDC within policy — NO root prompt. Confirm the on-chain delta.
    const before = await sacBalance(MERCHANT);
    const sessionSigner = ed25519Signer(sessionKp);
    const payReceipt = await paySessionTransfer({ account, accountAddr, sessionSigner, relayer, to: MERCHANT, amount: 500_000n });
    expect(payReceipt.ok).toBe(true);
    expect(payReceipt.transferTx).toMatch(/^[0-9a-f]{64}$/);
    let delta = 0n;
    for (let i = 0; i < 15; i++) {
      delta = (await sacBalance(MERCHANT)) - before;
      if (delta >= 500_000n) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    expect(delta).toBe(500_000n);

    // 5. Over-limit: 0.2 USDC > the 0.1/day cap → the policy rejects (SESSION_POLICY_VIOLATION).
    await expect(
      paySessionTransfer({ account, accountAddr, sessionSigner, relayer, to: MERCHANT, amount: 2_000_000n })
    ).rejects.toMatchObject({ code: "SESSION_POLICY_VIOLATION" });

    // 6. Revoke the session — root-signed remove_signer; takes effect immediately on-chain.
    const revokeReceipt = await client.revokeSession(granted);
    expect(revokeReceipt.ok).toBe(true);

    // 7. Post-revoke: the session key no longer authorizes anything → rejected.
    await expect(
      paySessionTransfer({ account, accountAddr, sessionSigner, relayer, to: MERCHANT, amount: 500_000n })
    ).rejects.toMatchObject({ code: "SESSION_POLICY_VIOLATION" });
  }, 300_000);
});
