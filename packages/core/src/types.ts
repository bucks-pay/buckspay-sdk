import type { xdr } from "@stellar/stellar-sdk";
import type { BuckspayError } from "./errors";

// ── §4.1 Identity, signing, calls ──────────────────────────────────────────

export type Network = "testnet" | "pubnet";

/** Chain string the facilitator expects. */
export type FacilitatorChain = "stellar-testnet" | "stellar-pubnet";

export type SignerType = "wallets-kit" | "passkey";

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

export interface AssembleInput {
  unsigned: xdr.SorobanAuthorizationEntry;
  signer: BuckspaySigner;
  signatureExpirationLedger: number;
  network: Network;
}

export interface AccountAdapter {
  readonly model: AccountModel;
  resolveAddress(signer: BuckspaySigner): Promise<string>;
  ensureReady(input: EnsureReadyInput): Promise<void>;
  buildUnsignedEntry(input: BuildEntryInput): xdr.SorobanAuthorizationEntry;
  /** returns the SIGNED auth entry as base64 XDR. */
  assembleSignedEntry(input: AssembleInput): Promise<string>;
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
  from: string; // G… (classic) or C… (contract, Sprint 4)
  to: string; // G…
  value: string; // stroops, decimal string
  authorizationEntryXdr: string; // base64, signed
  nonce: string; // decimal string
  signatureExpirationLedger: number;
}

/** EXACT shape of facilitator /relay response (soroban). The relayer adapter maps
 *  the facilitator's `blockNumber` (string) onto `ledger`. */
export interface Receipt {
  ok: boolean;
  via: string; // "buckspay_self" | ...
  token: string;
  chain: FacilitatorChain;
  transferTx: string;
  ledger?: number;
  status: string;
}

export interface Relayer {
  relay(payload: RelayPayload): Promise<Receipt>; // POST /relay
  getAccountState(address: string): Promise<AccountState>; // GET /stellar/account/:pk (or /contract/:addr)
  buildOnboard(input: { publicKey: string }): Promise<{ xdr: string }>; // POST /stellar/onboard/build
  submitOnboard(input: { publicKey: string; signedTxXdr: string }): Promise<{ ok: boolean }>; // POST /stellar/onboard/submit
  deployContract(input: { passkeyPublicKey: string }): Promise<{ address: string }>; // POST /stellar/contract/deploy (Sprint 4)
}

// ── §4.4 Engine, intents, client, config, state ────────────────────────────

// GasConfig stays a `type`, not an interface: in SP-2 it becomes a discriminated
// union (sponsored | token | self), which an interface cannot express.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GasConfig = { mode: "sponsored" }; // v1: sponsored only

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
}

export interface BuckspayWallet {
  address: string;
  model: AccountModel;
  getState(): Promise<AccountState>;
}

export interface BuckspayConfig {
  network: Network;
  account: AccountAdapter;
  signer: BuckspaySigner;
  relayer: Relayer;
  gas: GasConfig;
}

export interface BuckspayState {
  status: "idle" | "connecting" | "ready" | "signing" | "relaying" | "success" | "error";
  address: string | null;
  receipt: Receipt | null;
  error: BuckspayError | null;
}
