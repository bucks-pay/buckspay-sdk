/**
 * One-time setup for the classic-relay spike on Stellar testnet.
 *
 * - Generates a payer + recipient ed25519 keypair (the wallet stand-ins).
 * - Friendbot-funds both (so they exist with XLM).
 * - Adds a USDC trustline to both (payer must hold USDC; recipient must be able to receive it).
 * - Reads the local facilitator's API key and writes spikes/classic-relay/.env (gitignored).
 * - Prints the PAYER public key so you can fund it with testnet USDC at https://faucet.circle.com/.
 *
 * Secrets are written only to the gitignored .env and never logged.
 *
 * Usage (from spikes/classic-relay/):  tsx scripts/setup-testnet.ts
 */
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { config as loadDotenv } from "dotenv";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const FACILITATOR_URL = "http://localhost:3002";
const FACILITATOR_ENV = "/Users/david/Projects/buckspay/facilitator/.env";

const here = dirname(fileURLToPath(import.meta.url));
const spikeRoot = join(here, "..");
const envPath = join(spikeRoot, ".env");

const horizon = new Horizon.Server(HORIZON_URL);
const usdc = new Asset("USDC", USDC_ISSUER_TESTNET);

async function friendbotFund(pub: string): Promise<void> {
  const res = await fetch(`https://friendbot.stellar.org?addr=${pub}`);
  if (!res.ok && res.status !== 400) {
    throw new Error(`friendbot failed for ${pub}: ${await res.text()}`);
  }
}

async function ensureTrustline(kp: Keypair): Promise<string> {
  const pub = kp.publicKey();
  let account = await horizon.loadAccount(pub).catch(() => null);
  if (!account) {
    await friendbotFund(pub);
    account = await horizon.loadAccount(pub);
  }
  const has = account.balances.some(
    (b) =>
      b.asset_type !== "native" && b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER_TESTNET
  );
  if (has) return "trustline-exists";
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.changeTrust({ asset: usdc }))
    .setTimeout(60)
    .build();
  tx.sign(kp);
  const result = await horizon.submitTransaction(tx);
  return result.hash;
}

async function usdcBalance(pub: string): Promise<string> {
  const account = await horizon.loadAccount(pub);
  const line = account.balances.find(
    (b) =>
      b.asset_type !== "native" && b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER_TESTNET
  );
  return line?.balance ?? "0";
}

async function main(): Promise<void> {
  if (existsSync(envPath)) {
    console.error(`Refusing to overwrite existing ${envPath} (delete it to regenerate).`);
    process.exit(1);
  }

  loadDotenv({ path: FACILITATOR_ENV });
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error(`API_KEY not found in ${FACILITATOR_ENV}`);

  const payer = Keypair.random();
  const recipient = Keypair.random();

  console.log("→ Funding + adding USDC trustline to payer + recipient (testnet)...");
  const payerTrust = await ensureTrustline(payer);
  const recipientTrust = await ensureTrustline(recipient);
  console.log(`  payer trustline:     ${payerTrust}`);
  console.log(`  recipient trustline: ${recipientTrust}`);

  const envBody = [
    `FACILITATOR_URL=${FACILITATOR_URL}`,
    `FACILITATOR_API_KEY=${apiKey}`,
    `SOROBAN_RPC_URL=${SOROBAN_RPC_URL}`,
    `HORIZON_URL=${HORIZON_URL}`,
    `USDC_SAC=${USDC_SAC}`,
    `PAYER_SECRET=${payer.secret()}`,
    `RECIPIENT_PUBLIC_KEY=${recipient.publicKey()}`,
    ""
  ].join("\n");
  writeFileSync(envPath, envBody, { mode: 0o600 });

  const payerUsdc = await usdcBalance(payer.publicKey());

  console.log(`\n✓ Wrote ${envPath} (gitignored).`);
  console.log("─".repeat(64));
  console.log(`PAYER public key (fund with USDC at faucet.circle.com → Stellar):`);
  console.log(`  ${payer.publicKey()}`);
  console.log(`PAYER current USDC balance: ${payerUsdc}`);
  console.log(`RECIPIENT public key:`);
  console.log(`  ${recipient.publicKey()}`);
  console.log("─".repeat(64));
  console.log(
    Number(payerUsdc) === 0
      ? "\n→ NEXT: fund the PAYER above with testnet USDC, then run `pnpm spike`."
      : "\n→ Payer already holds USDC. Run `pnpm spike`."
  );
}

main().catch((err: unknown) => {
  console.error("setup failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
