import { authorizeEntry, hash, Keypair, type SigningCallback } from "@stellar/stellar-sdk";
import { z } from "zod";
import { buildUnsignedEntry } from "./auth-entry.js";

/** EXACT shape of facilitator stellarSorobanSchema (README §4.3 RelayPayload). */
export const relayPayloadSchema = z.object({
  token: z.string().regex(/^C[A-Z2-7]{55}$/),
  from: z.string().regex(/^G[A-Z2-7]{55}$/),
  to: z.string().regex(/^G[A-Z2-7]{55}$/),
  value: z.string().regex(/^\d+$/),
  authorizationEntryXdr: z.string().regex(/^[A-Za-z0-9+/]+=*$/).min(1),
  nonce: z.string().regex(/^\d+$/),
  signatureExpirationLedger: z.number().int().positive()
});
export type RelayPayload = z.infer<typeof relayPayloadSchema>;

/** EXACT shape of facilitator /relay soroban response (README §4.3 Receipt). */
export const receiptSchema = z.object({
  ok: z.boolean(),
  via: z.string(),
  token: z.string(),
  chain: z.string(),
  transferTx: z.string(),
  ledger: z.number().int().optional(),
  blockNumber: z.union([z.string(), z.null()]).optional(),
  status: z.string()
});
export type Receipt = z.infer<typeof receiptSchema>;

export interface SignLocalParams {
  payer: Keypair;
  networkPassphrase: string;
  sac: string;
  to: string;
  stroops: bigint;
  nonce: bigint;
  signatureExpirationLedger: number;
}

/**
 * Sign a USDC SAC transfer auth entry with a LOCAL ed25519 keypair. This stands in
 * for the browser wallet (Wallets Kit) in the spike: same authorizeEntry path, same
 * SigningCallback contract, but the key signs the preimage in-process.
 */
export async function signTransferAuthLocal(params: SignLocalParams): Promise<RelayPayload> {
  const { payer, networkPassphrase, sac, to, stroops, nonce, signatureExpirationLedger } = params;
  const from = payer.publicKey();

  const unsigned = buildUnsignedEntry({ sac, from, to, stroops, nonce });

  const signer: SigningCallback = (preimage) => {
    // Soroban auth signs the SHA-256 hash of the HashIdPreimage XDR. Wallets Kit /
    // Freighter hash internally; the local ed25519 stand-in must hash explicitly.
    const signature = payer.sign(hash(preimage.toXDR()));
    if (signature.length !== 64) {
      throw new Error(`unexpected signature length ${signature.length}`);
    }
    return Promise.resolve({ signature, publicKey: from });
  };

  const signed = await authorizeEntry(unsigned, signer, signatureExpirationLedger, networkPassphrase);

  return {
    token: sac,
    from,
    to,
    value: stroops.toString(),
    authorizationEntryXdr: signed.toXDR("base64"),
    nonce: nonce.toString(),
    signatureExpirationLedger
  };
}
