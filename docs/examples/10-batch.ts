// Recipe 10 — ATOMIC BATCH (sendCalls). N USDC transfers settle all-or-nothing in ONE tx via the
// pinned Multicall router's `batch_transfer` — the smart account (or classic wallet) authorizes the
// whole batch with a SINGLE signature. A batch of 1 is exactly pay([call]).
import {
  createBuckspayClient,
  batch,
  MAX_BATCH_CALLS,
  BuckspayError,
  type BuckspayConfig
} from "@buckspay/core";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { passkey } from "@buckspay/signers/passkey";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const SPONSOR_G = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const A = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const B = "GBPYQYRH62E6NLRGXHBT4I3ZPTEHVBQMYTSH44YLOAPTCDYNAXDOLJRY";

export const batchConfig: BuckspayConfig = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR_G }),
  signer: passkey({ rpId: "localhost", rpName: "buckspay" }),
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  gas: { mode: "sponsored" }
};

export const client = createBuckspayClient(batchConfig);

export async function payManyAtomically(): Promise<void> {
  await client.connect();
  // Collect calls with the pure builder (enforces MAX_BATCH_CALLS on build()).
  const calls = batch()
    .add(client.transfer({ token: USDC_SAC, to: A, amount: "1.00" }))
    .add(client.transfer({ token: USDC_SAC, to: B, amount: "2.50" }))
    .build();

  // sendCalls = atomic, all-or-nothing. Either BOTH transfers land or NEITHER does.
  const receipt = await client.sendCalls(calls);
  console.log(receipt.transferTx); // one settlement tx for the whole batch
}

export async function guardOversizeBatch(): Promise<void> {
  const tooMany = Array.from({ length: MAX_BATCH_CALLS + 1 }, () =>
    client.transfer({ token: USDC_SAC, to: A, amount: "0.01" })
  );
  try {
    await client.sendCalls(tooMany);
  } catch (e) {
    if (e instanceof BuckspayError && e.code === "BATCH_TOO_LARGE") {
      console.error(`batch capped at ${MAX_BATCH_CALLS} calls`);
      return;
    }
    throw e;
  }
}
