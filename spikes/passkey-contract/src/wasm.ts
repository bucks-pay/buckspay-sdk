import { Keypair, Operation, rpc, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";

/** Generous inclusion fee (stroops) so Soroban deploys/invokes aren't dropped as TRY_AGAIN_LATER. */
export const INCLUSION_FEE = "1000000";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Send a signed tx and confirm it, retrying on TRY_AGAIN_LATER (transient / fee-contention).
 * PENDING/DUPLICATE → poll; any other status throws with detail.
 */
export async function sendAndConfirm(
  server: rpc.Server,
  tx: Transaction,
  label = "tx"
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const sent = await server.sendTransaction(tx);
    if (sent.status === "PENDING" || sent.status === "DUPLICATE") return pollTx(server, sent.hash);
    if (sent.status === "TRY_AGAIN_LATER") {
      await sleep(4000);
      continue;
    }
    throw new Error(`${label} send failed: status=${sent.status} errorResult=${JSON.stringify(sent.errorResult ?? null)}`);
  }
  throw new Error(`${label}: still TRY_AGAIN_LATER after retries (testnet congestion — retry later)`);
}

/** sha256 of the wasm bytes as lowercase hex (the on-chain Wasm hash). */
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  // new Uint8Array(...) gives an ArrayBuffer-backed view (TS 5.7+ BufferSource requires it).
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Pin/verify the Wasm hash before install (README §3). Returns the verified hex. */
export async function verifyWasmHash(bytes: Uint8Array, expectedHex: string | undefined): Promise<string> {
  const actual = await sha256Hex(bytes);
  if (expectedHex && expectedHex.length === 64 && actual !== expectedHex) {
    throw new Error(`wasm hash mismatch: expected ${expectedHex}, got ${actual}`);
  }
  return actual;
}

export interface InstallWasmInput {
  rpcUrl: string;
  networkPassphrase: string;
  sponsor: Keypair;
  wasmBytes: Uint8Array;
}

/** Upload (install) the contract Wasm once; sponsor pays. Returns the hex Wasm hash for reuse. */
export async function installWasm(input: InstallWasmInput): Promise<{ wasmHashHex: string }> {
  const { rpcUrl, networkPassphrase, sponsor, wasmBytes } = input;
  const server = new rpc.Server(rpcUrl, { allowHttp: rpcUrl.startsWith("http://") });

  const source = await server.getAccount(sponsor.publicKey());
  const op = Operation.uploadContractWasm({ wasm: Buffer.from(wasmBytes) });
  const tx = new TransactionBuilder(source, { fee: INCLUSION_FEE, networkPassphrase })
    .addOperation(op)
    .setTimeout(180)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(sponsor);
  const confirmed = await sendAndConfirm(server, prepared, "uploadContractWasm");
  const returnValue = confirmed.returnValue;
  if (!returnValue) throw new Error("install returned no value (expected the Wasm hash)");
  const hashBytes = returnValue.bytes();
  return { wasmHashHex: Buffer.from(hashBytes).toString("hex") };
}

export async function pollTx(
  server: rpc.Server,
  hash: string,
  attempts = 50
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  for (let i = 0; i < attempts; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const got = await server.getTransaction(hash);
    if (got.status === rpc.Api.GetTransactionStatus.SUCCESS) return got;
    if (got.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`tx ${hash} failed on-chain`);
    }
  }
  throw new Error(`tx ${hash} not confirmed in ${attempts}s`);
}
