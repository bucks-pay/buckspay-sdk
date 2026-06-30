// Recipe 11 — SESSIONS (contract/passkey accounts only). Grant a scoped session key with on-chain
// policies (spend limit + allowlist), serialize it for later, then revoke it. Sessions are refused on
// the classic model: grantSession throws BuckspayError("INVALID_CONFIG").
import { Keypair } from "@stellar/stellar-sdk";
import { createBuckspayClient, createRpcSimContext, serializeSession, type BuckspayConfig } from "@buckspay/core";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { spendLimit, allowlist } from "@buckspay/accounts/policy";
import { passkey } from "@buckspay/signers/passkey";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const SPONSOR_G = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const APP_CONTRACT = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

const config: BuckspayConfig = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR_G }),
  signer: passkey({ rpId: "localhost", rpName: "buckspay" }), // the ROOT signer authorizes the install
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  gas: { mode: "sponsored" }
};

const client = createBuckspayClient(
  config,
  createRpcSimContext("https://soroban-testnet.stellar.org", { simSource: SPONSOR_G })
);

export async function runSession(): Promise<void> {
  await client.connect();

  // The session key is the ONE key the app deliberately mints — scoped + revocable, never the root
  // account key. Store its secret in secure storage; the SDK only ever needs its public key.
  const sessionKp = Keypair.random();

  const { session, receipt } = await client.grantSession({
    sessionKey: { type: "ed25519", publicKey: sessionKp.publicKey() },
    policies: [spendLimit({ token: USDC_SAC, max: "100", period: "day" }), allowlist([APP_CONTRACT])],
    expiresAt: Date.now() + 86_400_000 // 24h
  });
  console.log("granted", session.id, receipt.transferTx);

  // Persist the session (e.g. to secure storage) and rehydrate it later with deserializeSession.
  const blob = serializeSession(session);
  console.log("serialized session blob length", blob.length);

  // …the session key now pays within its policies, with no per-action root prompts…

  // Revoke when done (root-signed); the session key no longer authorizes anything.
  const revokeReceipt = await client.revokeSession(session);
  console.log("revoked", revokeReceipt.transferTx);
}
