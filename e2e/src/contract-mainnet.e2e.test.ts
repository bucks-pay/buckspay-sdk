import { describe, it, expect } from "vitest";
import {
  Address,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative
} from "@stellar/stellar-sdk";
import { buildMainnetClient } from "./harness.js";
import { MAINNET_ENABLED, e2eEnv } from "./env.js";
import { softwarePasskeySigner } from "./software-passkey.js";

/** Fund a freshly-deployed pubnet C-account with USDC via a SAC transfer signed by the payer. */
async function fundWithUsdc(to: string, stroops: bigint): Promise<void> {
  const kp = Keypair.fromSecret(e2eEnv.E2E_PAYER_SECRET_PUBNET!);
  const server = new rpc.Server(e2eEnv.SOROBAN_RPC_URL_PUBNET!, {
    allowHttp: e2eEnv.SOROBAN_RPC_URL_PUBNET!.startsWith("http://")
  });
  const source = await server.getAccount(kp.publicKey());
  const sac = new Contract(e2eEnv.E2E_USDC_PUBNET_SAC!);
  const tx = new TransactionBuilder(source, { fee: "1000000", networkPassphrase: Networks.PUBLIC })
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
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(kp);
  const sent = await server.sendTransaction(prepared);
  let confirmed = false;
  for (let i = 0; i < 30 && !confirmed; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const got = await server.getTransaction(sent.hash);
    if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) confirmed = true;
    if (got.status === rpc.Api.GetTransactionStatus.FAILED) throw new Error(`fund tx ${sent.hash} failed`);
  }
  if (!confirmed) throw new Error(`fund tx ${sent.hash} not confirmed`);

  // The transfer confirmed, but the SAC balance the pay's recording sim reads is indexed
  // with a lag — even on a dedicated pubnet RPC. Poll until the funded balance is visible.
  for (let i = 0; i < 15; i++) {
    const probeSource = await server.getAccount(kp.publicKey());
    const probe = new TransactionBuilder(probeSource, { fee: "100", networkPassphrase: Networks.PUBLIC })
      .addOperation(sac.call("balance", new Address(to).toScVal()))
      .setTimeout(30)
      .build();
    const sim = await server.simulateTransaction(probe);
    if (!rpc.Api.isSimulationError(sim) && sim.result?.retval) {
      const bal = BigInt(scValToNative(sim.result.retval) as bigint);
      if (bal >= stroops) return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`fund balance not visible for ${to} after polling`);
}

describe.skipIf(!MAINNET_ENABLED)("contract+passkey transfer (MAINNET smoke)", () => {
  it("creates passkey, deploys sponsored C-account, funds it, transfers 0.0001 USDC gasless on pubnet", async () => {
    const signer = await softwarePasskeySigner(e2eEnv.RP_ID);
    const { client } = buildMainnetClient("contract", signer);

    const wallet = await client.connect(); // deploys the OZ C-account (sponsored) + waits for materialization
    expect(wallet.model).toBe("contract");
    expect(wallet.address).toMatch(/^C[A-Z2-7]{55}$/);

    // connect() already waited, but a separate getState() can still hit a lagging RPC node.
    // Poll until the deploy is visible (eventual consistency) before funding.
    let state = await wallet.getState();
    for (let i = 0; i < 15 && !state.exists; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      state = await wallet.getState();
    }
    expect(state.exists).toBe(true);

    // Fund the fresh C-account with a TINY amount (0.001 USDC) so the 0.0001 transfer settles.
    await fundWithUsdc(wallet.address, 10_000n);

    const call = client.transfer({
      token: e2eEnv.E2E_USDC_PUBNET_SAC!,
      to: e2eEnv.E2E_MERCHANT_G_PUBNET!,
      amount: "0.0001" // TINY — 1000 stroops at 7 decimals
    });
    const receipt = await client.pay([call]);
    expect(receipt.ok).toBe(true);
    expect(receipt.chain).toBe("stellar-pubnet");
    expect(receipt.transferTx).toMatch(/^[0-9a-f]{64}$/);
  });
});
