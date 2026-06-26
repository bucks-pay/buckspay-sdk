import { config as loadDotenv } from "dotenv";
import { Networks } from "@stellar/stellar-sdk";
import { z } from "zod";

loadDotenv();

const gAddress = z.string().regex(/^G[A-Z2-7]{55}$/, "invalid Stellar G... address");
const sSecret = z.string().regex(/^S[A-Z2-7]{55}$/, "invalid Stellar S... secret");
const cContract = z.string().regex(/^C[A-Z2-7]{55}$/, "invalid Stellar C... contract id");

export const passkeySpikeConfigSchema = z.object({
  SOROBAN_RPC_URL: z.string().url(),
  HORIZON_URL: z.string().url(),
  SPONSOR_SECRET: sSecret,
  // Holds testnet USDC; funds the new C-address via the SAC (a C-account has no classic trustline).
  // Falls back to SPONSOR_SECRET when unset. The spike-02 payer is a convenient funder.
  USDC_FUNDER_SECRET: sSecret.optional().or(z.literal("")),
  USDC_SAC: cContract,
  RECIPIENT_PUBLIC_KEY: gAddress,
  OZ_SMART_ACCOUNT_WASM_PATH: z.string().min(1),
  OZ_SMART_ACCOUNT_WASM_HASH: z
    .string()
    .regex(/^[0-9a-f]{64}$/, "wasm hash must be 32-byte hex")
    .optional()
    .or(z.literal(""))
});

export type PasskeySpikeConfig = z.infer<typeof passkeySpikeConfigSchema>;

export const TESTNET = {
  networkPassphrase: Networks.TESTNET,
  usdcDecimals: 7,
  expirationLedgerWindow: 60
};

export function loadSpikeConfig(): PasskeySpikeConfig {
  const parsed = passkeySpikeConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `passkey spike config invalid:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`
    );
  }
  return parsed.data;
}
