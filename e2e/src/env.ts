import { z } from "zod";

/**
 * The SINGLE source of e2e config. Everything is env-driven and gitignored; no
 * secret is ever committed. Network tests are gated by BUCKSPAY_E2E=1 AND the
 * presence of the relevant secrets (see *.e2e.test.ts skipIf guards).
 */
const schema = z.object({
  BUCKSPAY_E2E: z.literal("1").optional(),
  FACILITATOR_URL: z.string().url().default("http://localhost:3000"),
  FACILITATOR_API_KEY: z.string().min(16).optional(),
  // Soroban RPC used by the SDK's recording simulator (prepare()).
  SOROBAN_RPC_URL: z.string().url().default("https://soroban-testnet.stellar.org"),
  // Pre-funded testnet payer (classic flow) secret — TEST ONLY, never committed.
  E2E_PAYER_SECRET: z
    .string()
    .regex(/^S[A-Z2-7]{55}$/)
    .optional(),
  E2E_MERCHANT_G: z
    .string()
    .regex(/^G[A-Z2-7]{55}$/)
    .optional(),
  E2E_USDC_TESTNET_SAC: z
    .string()
    .regex(/^C[A-Z2-7]{55}$/)
    .optional(),
  // Public facilitator sponsor/deployer G-address — required to derive the
  // contract C-address offline (the SDK never holds the sponsor secret).
  E2E_SPONSOR_G: z
    .string()
    .regex(/^G[A-Z2-7]{55}$/)
    .optional(),
  RP_ID: z.string().default("localhost")
});

export const e2eEnv = schema.parse(process.env);
export const E2E_ENABLED = e2eEnv.BUCKSPAY_E2E === "1";
