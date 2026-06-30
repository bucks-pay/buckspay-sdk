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
  RP_ID: z.string().default("localhost"),

  // ── MAINNET (pubnet) smoke — second-tier gate ─────────────────────────────
  // Opt-in flag, distinct from BUCKSPAY_E2E, so a testnet run can NEVER touch
  // real funds by accident. All pubnet vars are TEST-RUNNER-ONLY, gitignored.
  BUCKSPAY_E2E_MAINNET: z.literal("1").optional(),
  // Dedicated, consistent pubnet RPC (NOT a flaky public load balancer).
  SOROBAN_RPC_URL_PUBNET: z.string().url().optional(),
  // Circle's pubnet USDC SAC (C…), passed by the caller — never hardcoded.
  E2E_USDC_PUBNET_SAC: z
    .string()
    .regex(/^C[A-Z2-7]{55}$/)
    .optional(),
  E2E_SPONSOR_G_PUBNET: z
    .string()
    .regex(/^G[A-Z2-7]{55}$/)
    .optional(),
  E2E_PAYER_SECRET_PUBNET: z
    .string()
    .regex(/^S[A-Z2-7]{55}$/)
    .optional(),
  E2E_MERCHANT_G_PUBNET: z
    .string()
    .regex(/^G[A-Z2-7]{55}$/)
    .optional(),
  // Cross-feature smoke: a pre-funded session keypair (test-runner only) the smoke grants + uses.
  E2E_SESSION_SECRET_PUBNET: z
    .string()
    .regex(/^S[A-Z2-7]{55}$/)
    .optional(),

  // ── React Native simulator smoke — third-tier gate, distinct from BUCKSPAY_E2E ──
  // Never runs in a default `pnpm test`; requires a built app + a running simulator/device.
  BUCKSPAY_E2E_RN: z.literal("1").optional(),
  // "ios" | "android" — which simulator the Detox/Maestro driver targets.
  RN_E2E_PLATFORM: z.enum(["ios", "android"]).optional(),
  // Path to the prebuilt app binary (.app / .apk) the driver installs.
  RN_E2E_APP_BINARY: z.string().optional(),

  // ── SWAP (stretch) smoke — third-tier gate, independent of testnet/mainnet ────────
  BUCKSPAY_E2E_SWAP: z.literal("1").optional(),
  SWAP_CHAIN: z
    .enum(["avalanche", "celo", "polygon", "base", "avalanche-fuji", "polygon-amoy", "base-sepolia", "celo-sepolia"])
    .optional(),
  SWAP_PAYER_EVM: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
  SWAP_SELL_TOKEN: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
  SWAP_BUY_TOKEN: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
  SWAP_SELL_AMOUNT: z
    .string()
    .regex(/^\d+$/)
    .optional()
});

export const e2eEnv = schema.parse(process.env);
export const E2E_ENABLED = e2eEnv.BUCKSPAY_E2E === "1";

/**
 * Mainnet smoke is enabled only when the dedicated flag is set AND every pubnet
 * secret is present. This is the single source of the mainnet gate; the test
 * files just `skipIf(!MAINNET_ENABLED)`.
 */
export const MAINNET_ENABLED =
  e2eEnv.BUCKSPAY_E2E_MAINNET === "1" &&
  !!e2eEnv.SOROBAN_RPC_URL_PUBNET &&
  !!e2eEnv.FACILITATOR_API_KEY &&
  !!e2eEnv.E2E_USDC_PUBNET_SAC &&
  !!e2eEnv.E2E_SPONSOR_G_PUBNET &&
  !!e2eEnv.E2E_PAYER_SECRET_PUBNET &&
  !!e2eEnv.E2E_MERCHANT_G_PUBNET &&
  !!e2eEnv.E2E_SESSION_SECRET_PUBNET;

/**
 * React Native simulator smoke is enabled only when the dedicated flag is set AND a target
 * platform + a prebuilt app binary are present. Distinct from BUCKSPAY_E2E / BUCKSPAY_E2E_MAINNET
 * so neither a unit run nor a testnet run can spin up a simulator by accident.
 */
export const RN_E2E_ENABLED =
  e2eEnv.BUCKSPAY_E2E_RN === "1" && !!e2eEnv.RN_E2E_PLATFORM && !!e2eEnv.RN_E2E_APP_BINARY;

/** Swap smoke runs only with the flag AND every swap input present (quote-only; no funds move). */
export const SWAP_ENABLED =
  e2eEnv.BUCKSPAY_E2E_SWAP === "1" &&
  !!e2eEnv.FACILITATOR_API_KEY &&
  !!e2eEnv.SWAP_CHAIN &&
  !!e2eEnv.SWAP_PAYER_EVM &&
  !!e2eEnv.SWAP_SELL_TOKEN &&
  !!e2eEnv.SWAP_BUY_TOKEN &&
  !!e2eEnv.SWAP_SELL_AMOUNT;
