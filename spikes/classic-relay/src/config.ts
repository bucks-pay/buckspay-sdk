import { config as loadDotenv } from "dotenv";
import { Networks } from "@stellar/stellar-sdk";
import { z } from "zod";

loadDotenv();

const gAddress = z.string().regex(/^G[A-Z2-7]{55}$/, "invalid Stellar G... address");
const sSecret = z.string().regex(/^S[A-Z2-7]{55}$/, "invalid Stellar S... secret");
const cContract = z.string().regex(/^C[A-Z2-7]{55}$/, "invalid Stellar C... contract id");

export const spikeConfigSchema = z.object({
  FACILITATOR_URL: z
    .string()
    .url()
    .transform((u) => u.replace(/\/+$/, "")),
  FACILITATOR_API_KEY: z.string().min(1),
  SOROBAN_RPC_URL: z.string().url(),
  HORIZON_URL: z.string().url(),
  USDC_SAC: cContract,
  PAYER_SECRET: sSecret,
  RECIPIENT_PUBLIC_KEY: gAddress
});

export type SpikeConfig = z.infer<typeof spikeConfigSchema>;

export const TESTNET = {
  networkPassphrase: Networks.TESTNET,
  /** facilitator chain string for testnet */
  facilitatorChain: "stellar-testnet" as const,
  /** USDC has 7 decimals on Stellar */
  usdcDecimals: 7,
  /** ledger window before the auth signature expires */
  expirationLedgerWindow: 60
};

export function loadSpikeConfig(): SpikeConfig {
  const parsed = spikeConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`spike config invalid:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`);
  }
  return parsed.data;
}
