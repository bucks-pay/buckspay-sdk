import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  Address,
  BASE_FEE,
  Contract,
  hash,
  Horizon,
  Keypair,
  Operation,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
import { loadSpikeConfig, TESTNET } from "./config.js";
import { INCLUSION_FEE, installWasm, sendAndConfirm, verifyWasmHash } from "./wasm.js";
import { buildTransferArgs, deployContractAccount } from "./contract-account.js";
import { exportUncompressedPubkey, generateP256Key, toHex } from "./secp256r1.js";
import { assembleWebAuthnSigData, preimageHash, signWebAuthnAssertion } from "./check-auth.js";

const RP_ID = "buckspay.dev";

function log(step: string, detail?: Record<string, unknown>): void {
  console.log(`[gate] ${step}`, detail ?? "");
}

async function main(): Promise<void> {
  const cfg = loadSpikeConfig();
  const sponsor = Keypair.fromSecret(cfg.SPONSOR_SECRET);
  const funder = Keypair.fromSecret(cfg.USDC_FUNDER_SECRET || cfg.SPONSOR_SECRET);
  const server = new rpc.Server(cfg.SOROBAN_RPC_URL, {
    allowHttp: cfg.SOROBAN_RPC_URL.startsWith("http://")
  });
  const horizon = new Horizon.Server(cfg.HORIZON_URL);

  // --- (a) Q1: install Wasm (once) + deploy a C-address bound to a secp256r1 key, sponsored ---
  const wasmBytes = new Uint8Array(await readFile(cfg.OZ_SMART_ACCOUNT_WASM_PATH));
  const verified = await verifyWasmHash(wasmBytes, cfg.OZ_SMART_ACCOUNT_WASM_HASH || undefined);
  log("wasm verified", { sha256: verified });

  const wasmHashHex =
    cfg.OZ_SMART_ACCOUNT_WASM_HASH && cfg.OZ_SMART_ACCOUNT_WASM_HASH.length === 64
      ? cfg.OZ_SMART_ACCOUNT_WASM_HASH
      : (
          await installWasm({
            rpcUrl: cfg.SOROBAN_RPC_URL,
            networkPassphrase: TESTNET.networkPassphrase,
            sponsor,
            wasmBytes
          })
        ).wasmHashHex;
  log("Q1: wasm installed (one-time per network)", { wasmHashHex });

  const authnKey = await generateP256Key();
  const pubkey65 = await exportUncompressedPubkey(authnKey.publicKey);
  const { address: cAddress } = await deployContractAccount({
    rpcUrl: cfg.SOROBAN_RPC_URL,
    networkPassphrase: TESTNET.networkPassphrase,
    sponsor,
    wasmHashHex,
    pubkey65
  });
  log("Q1: passkey contract account deployed (sponsored)", { cAddress, pubkey: toHex(pubkey65).slice(0, 16) + "…" });

  // --- (b) Q2: fund the C-address with USDC via the SAC and read its balance (NO changeTrust) ---
  await sacTransfer(server, funder, cfg.USDC_SAC, funder.publicKey(), cAddress, 1_000_000n); // 0.1 USDC
  const cBalance = await sacBalanceOf(server, cfg.USDC_SAC, cAddress, sponsor.publicKey());
  assert.ok(cBalance >= 1_000_000n, `C-address USDC balance ${cBalance} < funded 0.1 USDC`);
  log("Q2: C-address holds USDC via the SAC (no trustline)", { cBalance: cBalance.toString() });

  // --- (c)+(d) Q3: transfer from=C, sign WebAuthn, assemble WebAuthnSigData, relay, on-chain verify ---
  const latest = await server.getLatestLedger();
  const sigExpLedger = latest.sequence + TESTNET.expirationLedgerWindow;

  const stroops = 500_000n; // 0.05 USDC out of the 0.1 funded
  const args = buildTransferArgs({ from: cAddress, to: cfg.RECIPIENT_PUBLIC_KEY, stroops });
  const func = xdr.HostFunction.hostFunctionTypeInvokeContract(
    new xdr.InvokeContractArgs({
      contractAddress: new Address(cfg.USDC_SAC).toScAddress(),
      functionName: "transfer",
      args
    })
  );

  // 1) recording simulation to obtain the auth entry (with nonce) for from=C
  const sac = new Contract(cfg.USDC_SAC);
  const probeSource = await server.getAccount(sponsor.publicKey());
  const probe = new TransactionBuilder(probeSource, {
    fee: BASE_FEE,
    networkPassphrase: TESTNET.networkPassphrase
  })
    .addOperation(sac.call("transfer", ...args))
    .setTimeout(180)
    .build();
  const sim1 = await server.simulateTransaction(probe);
  if (rpc.Api.isSimulationError(sim1)) throw new Error(`recording sim failed: ${sim1.error}`);
  const authEntries = sim1.result?.auth ?? [];
  assert.ok(authEntries.length >= 1, "recording simulation must yield an auth entry for the C-address");

  // 2) sign each contract-address auth entry with the WebAuthn assertion (OZ WebAuthnSigData scval)
  const signedEntries = await signContractAuthEntries({
    entries: authEntries,
    networkPassphrase: TESTNET.networkPassphrase,
    sigExpLedger,
    privateKey: authnKey.privateKey
  });

  // 3) enforcing simulation with the signed auth — this RUNS __check_auth and verifies our signature
  const enforceSource = await server.getAccount(sponsor.publicKey());
  const enforced = new TransactionBuilder(enforceSource, {
    fee: BASE_FEE,
    networkPassphrase: TESTNET.networkPassphrase
  })
    .addOperation(Operation.invokeHostFunction({ func, auth: signedEntries }))
    .setTimeout(180)
    .build();
  const sim2 = await server.simulateTransaction(enforced);
  if (rpc.Api.isSimulationError(sim2)) {
    throw new Error(`Q3 enforcing sim rejected (check __check_auth / WebAuthnSigData format): ${sim2.error}`);
  }
  log("Q3: enforcing simulation passed — __check_auth verified the secp256r1 signature");

  // 4) assemble with the simulation's footprint + fee, sponsor pays, submit
  const finalSource = await server.getAccount(sponsor.publicKey());
  const fee = (BigInt(sim2.minResourceFee) + 1_000_000n).toString();
  const finalTx = new TransactionBuilder(finalSource, {
    fee,
    networkPassphrase: TESTNET.networkPassphrase
  })
    .addOperation(Operation.invokeHostFunction({ func, auth: signedEntries }))
    .setSorobanData(sim2.transactionData.build())
    .setTimeout(180)
    .build();
  finalTx.sign(sponsor);

  const confirmed = await sendAndConfirm(server, finalTx, "relay");
  const txHash = confirmed.txHash;
  log("Q3: relay accepted on-chain", { txHash });

  const ok = await horizonConfirms(horizon, txHash);
  assert.ok(ok, `tx ${txHash} not confirmed successful on Horizon`);

  log("GATE GREEN — passkey/contract path proven end-to-end", { txHash, cAddress });
  console.log(
    `\nExplorer: https://stellar.expert/explorer/testnet/tx/${txHash}\n` +
      `Account:  https://stellar.expert/explorer/testnet/contract/${cAddress}\n` +
      "→ Fill DECISION.md (GO) and unblock Sprint 4."
  );
}

interface SignEntriesInput {
  entries: xdr.SorobanAuthorizationEntry[];
  networkPassphrase: string;
  sigExpLedger: number;
  privateKey: CryptoKey;
}

/**
 * Sign each SorobanAddressCredentials auth entry for the passkey contract account:
 * build the HashIdPreimageSorobanAuthorization, take its sha256 as the `signature_payload`,
 * produce a WebAuthn assertion over it, and set the OZ `WebAuthnSigData` scval as the credential
 * signature. (authorizeEntry is ed25519-only and is NOT used for contract accounts.)
 */
async function signContractAuthEntries(input: SignEntriesInput): Promise<xdr.SorobanAuthorizationEntry[]> {
  const { entries, networkPassphrase, sigExpLedger, privateKey } = input;
  const networkId = hash(Buffer.from(networkPassphrase));
  const out: xdr.SorobanAuthorizationEntry[] = [];

  for (const entry of entries) {
    if (entry.credentials().switch().name !== "sorobanCredentialsAddress") {
      out.push(entry);
      continue;
    }
    const addrCreds = entry.credentials().address();
    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId,
        nonce: addrCreds.nonce(),
        signatureExpirationLedger: sigExpLedger,
        invocation: entry.rootInvocation()
      })
    );
    const signaturePayload = await preimageHash(preimage.toXDR());
    const assertion = await signWebAuthnAssertion({ privateKey, signaturePayload, rpId: RP_ID });
    const sigScval = assembleWebAuthnSigData(assertion);

    const newCreds = new xdr.SorobanAddressCredentials({
      address: addrCreds.address(),
      nonce: addrCreds.nonce(),
      signatureExpirationLedger: sigExpLedger,
      signature: sigScval
    });
    out.push(
      new xdr.SorobanAuthorizationEntry({
        credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(newCreds),
        rootInvocation: entry.rootInvocation()
      })
    );
  }
  return out;
}

/** SAC transfer(from,to,amount) where `from` == the signer (a G-account funding the C-address with USDC). */
async function sacTransfer(
  server: rpc.Server,
  signer: Keypair,
  sacId: string,
  from: string,
  to: string,
  stroops: bigint
): Promise<void> {
  const sac = new Contract(sacId);
  const source = await server.getAccount(signer.publicKey());
  const tx = new TransactionBuilder(source, { fee: INCLUSION_FEE, networkPassphrase: TESTNET.networkPassphrase })
    .addOperation(sac.call("transfer", ...buildTransferArgs({ from, to, stroops })))
    .setTimeout(120)
    .build();
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(signer);
  await sendAndConfirm(server, prepared, "sac-fund");
}

/** Read balance(owner) on the SAC via simulation (works for a C-address; no trustline needed). */
async function sacBalanceOf(server: rpc.Server, sacId: string, owner: string, gSource: string): Promise<bigint> {
  const sac = new Contract(sacId);
  const source = await server.getAccount(gSource);
  const tx = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase: TESTNET.networkPassphrase })
    .addOperation(sac.call("balance", new Address(owner).toScVal()))
    .setTimeout(60)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new Error(`balance sim failed: ${sim.error}`);
  const retval = sim.result?.retval;
  if (!retval) throw new Error("balance sim returned no retval");
  return BigInt(scValToNative(retval) as bigint);
}

async function horizonConfirms(horizon: Horizon.Server, hashId: string, attempts = 20): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const tx = (await horizon.transactions().transaction(hashId).call()) as unknown as { successful: boolean };
      return tx.successful;
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      throw err;
    }
  }
  return false;
}

main().catch((err: unknown) => {
  console.error("[gate] NO-GO (so far):", err instanceof Error ? err.message : err);
  console.error("→ Record the failing question + error in DECISION.md before retrying.");
  process.exitCode = 1;
});
