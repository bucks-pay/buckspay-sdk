import { readFile } from "node:fs/promises";
import { Keypair } from "@stellar/stellar-sdk";
import { loadSpikeConfig, TESTNET } from "./config.js";
import { installWasm, verifyWasmHash } from "./wasm.js";

async function main(): Promise<void> {
  const cfg = loadSpikeConfig();
  const sponsor = Keypair.fromSecret(cfg.SPONSOR_SECRET);
  const wasmBytes = new Uint8Array(await readFile(cfg.OZ_SMART_ACCOUNT_WASM_PATH));

  const expected = cfg.OZ_SMART_ACCOUNT_WASM_HASH || undefined;
  const verifiedHash = await verifyWasmHash(wasmBytes, expected);
  console.log(`[deploy] OZ Smart Account wasm sha256: ${verifiedHash}`);

  const { wasmHashHex } = await installWasm({
    rpcUrl: cfg.SOROBAN_RPC_URL,
    networkPassphrase: TESTNET.networkPassphrase,
    sponsor,
    wasmBytes
  });

  console.log(`[deploy] installed Wasm hash (reuse for createCustomContract): ${wasmHashHex}`);
  console.log("→ Q1 resolved: install is ONE-TIME per network; record this hash in OPEN_QUESTIONS.md.");
}

main().catch((err: unknown) => {
  console.error("[deploy] FAILED:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
