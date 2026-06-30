import type { xdr } from "@stellar/stellar-sdk";
import type { BuckspayError } from "./errors";

// ── §4.1 Identity, signing, calls ──────────────────────────────────────────

export type Network = "testnet" | "pubnet";

/** Chain string the facilitator expects. */
export type FacilitatorChain = "stellar-testnet" | "stellar-pubnet";

// "social"/"email" are the onboarding signers (`@buckspay/signers/{social,email}`). They produce a
// Stellar ed25519 key from an external provider; additive union members.
export type SignerType = "wallets-kit" | "passkey" | "social" | "email";

export interface SignerKey {
  type: "ed25519" | "secp256r1";
  /** ed25519 → Stellar G-address (StrKey). secp256r1 → 65-byte uncompressed pubkey, hex. */
  publicKey: string;
}

export interface AuthEntryPayload {
  /** base64 XDR of the Soroban HashIDPreimage the wallet/authenticator must sign. */
  preimageXdr: string;
  network: Network;
  signatureExpirationLedger: number;
}

export interface Signature {
  /** raw signature bytes; 64 bytes for ed25519, contract-defined for passkey. */
  signature: Uint8Array;
  /** echoes the signer public key used to build credentials. */
  publicKey: string;
}

export interface BuckspaySigner {
  readonly type: SignerType;
  getPublicKey(): Promise<SignerKey>;
  signAuthEntry(payload: AuthEntryPayload): Promise<Signature>;
  /**
   * Sign a full transaction envelope (classic sponsored onboarding signs the
   * sponsor-sandwich tx, not an auth-entry). Optional: only external-wallet
   * signers (wallets-kit) implement it; passkey signers omit it. Returns the
   * signed transaction as base64 XDR. The classic account adapter detects it
   * structurally and raises ACCOUNT_NOT_READY if a signer can't sign txs.
   */
  signTransaction?(txXdr: string, ctx: { network: Network; address: string }): Promise<string>;
  /**
   * Social/email signers only: run the provider's auth flow and
   * resolve the Stellar key. wallets-kit / passkey signers omit it. After it
   * resolves, getPublicKey()/signAuthEntry() operate on the provider-issued key.
   */
  authenticate?(params?: Record<string, unknown>): Promise<AuthDetails>;
}

export interface Call {
  /** C-address of the target contract (e.g. USDC SAC). */
  contract: string;
  fn: string; // e.g. "transfer"
  args: xdr.ScVal[];
}

// ── §4.2 Accounts ──────────────────────────────────────────────────────────

export type AccountModel = "classic" | "contract";

export interface EnsureReadyInput {
  address: string;
  relayer: Relayer;
  signer: BuckspaySigner;
  network: Network;
}

export interface BuildEntryInput {
  from: string; // G… (classic) or C… (contract)
  call: Call;
  nonce: bigint;
}

export interface BuildBatchEntryInput {
  from: string; // G… (classic) or C… (contract)
  calls: Call[];
  nonce: bigint;
  // The active network selects the per-network pinned Multicall router C-address (the router
  // contract differs per deploy). A batch of 1 ignores it (delegates to the single-call builder).
  network: Network;
}

export interface AssembleInput {
  unsigned: xdr.SorobanAuthorizationEntry;
  signer: BuckspaySigner;
  signatureExpirationLedger: number;
  network: Network;
}

/** Input to build the unsigned session-install entry (contract account model). The session's
 *  on-chain expiry is derived from `grant.expiresAt`. */
export interface SessionInstallInput {
  from: string; // the connected smart-account C-address (self-administers)
  grant: SessionGrant;
  nonce: bigint;
}

/** Input to build the unsigned session-revoke entry (contract account model). */
export interface SessionRevokeInput {
  from: string; // the connected smart-account C-address
  sessionKey: string; // ed25519 G-address of the session signer to revoke
  nonce: bigint;
}

export interface AccountAdapter {
  readonly model: AccountModel;
  resolveAddress(signer: BuckspaySigner): Promise<string>;
  ensureReady(input: EnsureReadyInput): Promise<void>;
  buildUnsignedEntry(input: BuildEntryInput): xdr.SorobanAuthorizationEntry;
  /** Build ONE unsigned auth entry covering an atomic batch of calls. For N>1 it is the pinned
   *  Multicall router's `batch_transfer(payer, token, Vec<(to, amount)>)` invocation with the N
   *  transfers as sub-invocations (one nonce, one signature for the whole batch — SAME shape for
   *  classic and contract, only the signer differs). A batch of 1 MUST equal buildUnsignedEntry of
   *  the same call (golden no-regression invariant). */
  buildUnsignedBatchEntry(input: BuildBatchEntryInput): xdr.SorobanAuthorizationEntry;
  /** returns the SIGNED auth entry as base64 XDR. */
  assembleSignedEntry(input: AssembleInput): Promise<string>;
  /** Contract account model only: the UNSIGNED entry that installs a policy-scoped session signer
   *  (the account self-administers, authorized by the root signer at assemble time). Classic adapters
   *  omit it → the session flow refuses with INVALID_CONFIG. */
  buildSessionInstallEntry?(input: SessionInstallInput): xdr.SorobanAuthorizationEntry;
  /** Contract account model only: the UNSIGNED entry that revokes a session signer. */
  buildSessionRevokeEntry?(input: SessionRevokeInput): xdr.SorobanAuthorizationEntry;
}

// ── §4.3 Relayer (mirrors facilitator endpoints 1:1) ───────────────────────

export interface AccountState {
  exists: boolean;
  hasUsdcTrustline: boolean;
  xlmBalance?: string;
  usdcBalance?: string;
}

/** EXACT shape of facilitator stellarSorobanSchema. */
export interface RelayPayload {
  token: string; // C…
  from: string; // G… (classic) or C… (contract account model)
  to: string; // G…
  value: string; // stroops, decimal string
  authorizationEntryXdr: string; // base64, signed
  nonce: string; // decimal string
  signatureExpirationLedger: number;
  // gas mode "token" — signals the facilitator to validate a forward() invocation
  // (the authorizationEntryXdr above IS the forward() entry; there is no separate fee entry).
  feeToken?: string;
  // Session install/revoke marker — the facilitator relays this as an ordinary contract call (no
  // separate route). Absent for ordinary transfers.
  sessionOp?: "install" | "revoke";
}

/** EXACT shape of facilitator /relay response (soroban). The relayer adapter maps
 *  the facilitator's `blockNumber` (string) onto `ledger`. */
export interface Receipt {
  ok: boolean;
  via: string; // "buckspay_self" | ...
  token: string;
  // Additive widening: the Soroban relay returns a stellar-* chain; the optional EVM swap rail
  // returns its own SwapChain. Every existing value stays valid.
  chain: FacilitatorChain | SwapChain;
  transferTx: string;
  ledger?: number;
  status: string;
}

export interface Relayer {
  relay(payload: RelayPayload): Promise<Receipt>; // POST /relay
  /** Quote the fee-token amount + forwarder/collector for paying Soroban gas in `token` (gas mode "token").
   *  OPTIONAL: a relayer that does not support gas-in-token omits it; `prepare()` then refuses token mode
   *  with INVALID_CONFIG. Keeping it optional makes adding token gas additive (non-breaking). POST /fee/quote */
  feeQuote?(input: { from: string; token: string; calls: Call[] }): Promise<FeeQuote>;
  getAccountState(address: string): Promise<AccountState>; // GET /stellar/account/:pk (or /contract/:addr)
  buildOnboard(input: { publicKey: string }): Promise<{ xdr: string }>; // POST /stellar/onboard/build
  submitOnboard(input: { publicKey: string; signedTxXdr: string }): Promise<{ ok: boolean }>; // POST /stellar/onboard/submit
  deployContract(input: { passkeyPublicKey: string }): Promise<{ address: string }>; // POST /stellar/contract/deploy (contract account model)
  /** Deploy a policy-scoped session account bound to an ed25519 root key. OPTIONAL: a relayer that
   *  does not support session accounts omits it; the policy-account adapter then refuses to deploy
   *  with INVALID_CONFIG. POST /stellar/session-account/deploy */
  deploySessionAccount?(input: { rootPublicKey: string }): Promise<{ address: string }>;
  /** STRETCH: gasless swap via the facilitator's EXISTING /swap/* rail. OPTIONAL — a relayer
   *  without swap support (no swapChain) omits these; `BuckspayClient.swap` then fails closed with
   *  SWAP_FAILED. */
  quoteSwap?(req: SwapQuoteRequest): Promise<SwapQuote>;
  swap?(req: SwapRequest): Promise<Receipt>;
}

// ── §4.4 Engine, intents, client, config, state ────────────────────────────

// GasConfig is a discriminated union: `sponsored` (v1, gasless) | `token`
// (the fee is paid in a stablecoin via the FeeForwarder). A union is not an
// object-type alias, so no consistent-type-definitions exception is needed.
export type GasConfig =
  | { mode: "sponsored" }
  | { mode: "token"; token: string; maxFee?: string };

/** FeeForwarder quote returned by the facilitator (`POST /fee/quote`). */
export interface FeeQuote {
  forwarder: string;
  collector: string;
  token: string;
  estimatedXlmFee: string;
  tokenAmount: string;
  expiresAtLedger: number;
}

/** Resolved identity a social/email provider hands back. */
export interface AuthDetails {
  publicKey: string;
  provider: string;
  expiresAt?: number;
}

/** Session policy compiled to an on-chain policy signer in `__check_auth`. */
export type SessionPolicy =
  | { kind: "spendLimit"; token: string; max: string; period: "day" | "week" | "month" | "total" }
  | { kind: "allowlist"; contracts: string[] };

export interface SessionGrant {
  sessionKey: SignerKey;
  policies: SessionPolicy[];
  expiresAt: number;
}

export interface Session {
  id: string;
  account: string;
  sessionKey: string;
  policies: SessionPolicy[];
  expiresAt: number;
}

/** Swap quote. */
export interface SwapQuote {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
}

/** EVM chains the facilitator's existing /swap/* rail supports. Mirrors
 *  facilitator/src/schema.ts `swapChainSchema`. STRETCH-only. */
export type SwapChain =
  | "avalanche"
  | "celo"
  | "polygon"
  | "base"
  | "avalanche-fuji"
  | "polygon-amoy"
  | "base-sepolia"
  | "celo-sepolia";

/** Normalized swap request the client hands the relayer adapter (the connected wallet is the payer). */
export interface SwapQuoteRequest {
  payer: string;
  tokenIn: string;
  tokenOut: string;
  amount: string; // sell amount, minimal units (wei), decimal string
}
export interface SwapRequest extends SwapQuoteRequest {
  minOut?: string; // tokenOut minimal-unit floor; the client enforces it before submit
}

export interface PreparedIntent {
  from: string;
  to: string;
  token: string;
  value: string;
  nonce: string;
  signatureExpirationLedger: number;
  network: Network;
  unsignedEntry: xdr.SorobanAuthorizationEntry;
  preimageXdr: string;
  // gas mode "token" — `unsignedEntry`/`preimageXdr` above describe the single forward()
  // invocation; `feeQuote` is the quote it was built from. No separate fee entry.
  feeQuote?: FeeQuote;
}

export interface SignedIntent {
  from: string;
  to: string;
  token: string;
  value: string;
  nonce: string;
  signatureExpirationLedger: number;
  network: Network;
  authorizationEntryXdr: string; // signed, base64
  // gas mode "token" — `authorizationEntryXdr` IS the signed forward() entry; this names the fee token.
  feeToken?: string;
}

export interface BuckspayWallet {
  address: string;
  model: AccountModel;
  getState(): Promise<AccountState>;
}

/** Grant / revoke policy-scoped session keys on a contract account. */
export interface SessionManager {
  grantSession(grant: SessionGrant): Promise<{ session: Session; receipt: Receipt }>;
  revokeSession(session: Session | string): Promise<Receipt>;
}

export interface BuckspayConfig {
  network: Network;
  account: AccountAdapter;
  signer: BuckspaySigner;
  relayer: Relayer;
  gas: GasConfig;
  /**
   * Explicit mainnet (pubnet) opt-in for environments with no `process.env`
   * (browsers). ORed with the Node env `BUCKSPAY_ALLOW_MAINNET=1`. Pubnet stays
   * refused unless at least one signal is present; testnet ignores this flag.
   * `resolveNetwork` remains the single gate — this flag only feeds it.
   */
  allowMainnet?: boolean;
}

export interface BuckspayState {
  status: "idle" | "connecting" | "ready" | "signing" | "relaying" | "success" | "error";
  address: string | null;
  receipt: Receipt | null;
  error: BuckspayError | null;
}
