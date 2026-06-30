import { Address, Keypair, StrKey, xdr } from "@stellar/stellar-sdk";
import { buildUnsignedCallEntry, buildUnsignedEntry } from "../../src/auth-entry-builder";
import type {
  AccountAdapter,
  AccountState,
  AssembleInput,
  BuckspayConfig,
  BuckspaySigner,
  BuildBatchEntryInput,
  BuildEntryInput,
  Call,
  EnsureReadyInput,
  FeeQuote,
  Receipt,
  RelayPayload,
  Relayer,
  SignerKey
} from "../../src/types";

export const MOCK_FROM = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 11)).publicKey();
export const MOCK_TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 22)).publicKey();
export const MOCK_SAC = StrKey.encodeContract(Buffer.alloc(32, 33));

export function makeMockSigner(): BuckspaySigner & { signCalls: number } {
  const signer = {
    type: "wallets-kit" as const,
    signCalls: 0,
    async getPublicKey(): Promise<SignerKey> {
      return { type: "ed25519", publicKey: MOCK_FROM };
    },
    async signAuthEntry() {
      signer.signCalls += 1;
      return { signature: new Uint8Array(64).fill(7), publicKey: MOCK_FROM };
    }
  };
  return signer;
}

export interface MockAccount extends AccountAdapter {
  sac: string;
  ensureReadyCalls: EnsureReadyInput[];
  assembleCalls: AssembleInput[];
}

export function makeMockAccount(): MockAccount {
  const ensureReadyCalls: EnsureReadyInput[] = [];
  const assembleCalls: AssembleInput[] = [];
  return {
    model: "classic",
    sac: MOCK_SAC,
    async resolveAddress(signer: BuckspaySigner): Promise<string> {
      return (await signer.getPublicKey()).publicKey;
    },
    async ensureReady(input: EnsureReadyInput): Promise<void> {
      ensureReadyCalls.push(input);
    },
    buildUnsignedEntry(input: BuildEntryInput): xdr.SorobanAuthorizationEntry {
      return buildUnsignedEntry({
        sac: MOCK_SAC,
        from: input.from,
        to: MOCK_TO,
        stroops: 15_000_000n,
        nonce: input.nonce
      });
    },
    buildUnsignedBatchEntry(input: BuildBatchEntryInput): xdr.SorobanAuthorizationEntry {
      const first = input.calls[0];
      if (!first) throw new Error("buildUnsignedBatchEntry requires at least one call");
      if (input.calls.length === 1) {
        return buildUnsignedEntry({ sac: MOCK_SAC, from: input.from, to: MOCK_TO, stroops: 15_000_000n, nonce: input.nonce });
      }
      // A batch_transfer-shaped entry (Address credentials) — enough for the client batch tests.
      const transfers = xdr.ScVal.scvVec(input.calls.map((c) => xdr.ScVal.scvVec([c.args[1]!, c.args[2]!])));
      return buildUnsignedCallEntry({
        from: input.from,
        contract: StrKey.encodeContract(Buffer.alloc(32, 77)),
        fn: "batch_transfer",
        args: [new Address(input.from).toScVal(), new Address(MOCK_SAC).toScVal(), transfers],
        nonce: input.nonce,
        subInvocations: input.calls.map((c) => ({ contract: c.contract, fn: c.fn, args: c.args }))
      });
    },
    async assembleSignedEntry(input: AssembleInput): Promise<string> {
      assembleCalls.push(input);
      // Exercise the signer so signer.signCalls increments in the real flow.
      await input.signer.signAuthEntry({
        preimageXdr: "AAAA",
        network: input.network,
        signatureExpirationLedger: input.signatureExpirationLedger
      });
      return `signed:${input.unsigned.toXDR("base64")}`;
    },
    ensureReadyCalls,
    assembleCalls
  };
}

export interface MockRelayer extends Relayer {
  relayCalls: RelayPayload[];
  feeQuoteCalls: { from: string; token: string; calls: Call[] }[];
  nextReceipt: Receipt;
  nextFeeQuote: FeeQuote;
  nextState: AccountState;
}

export function makeMockRelayer(): MockRelayer {
  const relayCalls: RelayPayload[] = [];
  const feeQuoteCalls: { from: string; token: string; calls: Call[] }[] = [];
  const r: MockRelayer = {
    relayCalls,
    feeQuoteCalls,
    nextReceipt: {
      ok: true,
      via: "buckspay_self",
      token: MOCK_SAC,
      chain: "stellar-testnet",
      transferTx: "abc123",
      ledger: 1000061,
      status: "success"
    },
    nextFeeQuote: {
      forwarder: StrKey.encodeContract(Buffer.alloc(32, 55)),
      collector: StrKey.encodeContract(Buffer.alloc(32, 66)),
      token: MOCK_SAC,
      estimatedXlmFee: "1000000",
      tokenAmount: "132000",
      expiresAtLedger: 1_000_120
    },
    nextState: { exists: true, hasUsdcTrustline: true, xlmBalance: "5", usdcBalance: "100" },
    async relay(payload: RelayPayload): Promise<Receipt> {
      relayCalls.push(payload);
      return r.nextReceipt;
    },
    async feeQuote(input: { from: string; token: string; calls: Call[] }): Promise<FeeQuote> {
      feeQuoteCalls.push(input);
      return r.nextFeeQuote;
    },
    async getAccountState(): Promise<AccountState> {
      return r.nextState;
    },
    async buildOnboard() {
      return { xdr: "onboard-xdr" };
    },
    async submitOnboard() {
      return { ok: true };
    },
    async deployContract() {
      return { address: StrKey.encodeContract(Buffer.alloc(32, 44)) };
    }
  };
  return r;
}

export function makeMockConfig(): {
  config: BuckspayConfig;
  account: MockAccount;
  signer: ReturnType<typeof makeMockSigner>;
  relayer: MockRelayer;
} {
  const account = makeMockAccount();
  const signer = makeMockSigner();
  const relayer = makeMockRelayer();
  const config: BuckspayConfig = {
    network: "testnet",
    account,
    signer,
    relayer,
    gas: { mode: "sponsored" }
  };
  return { config, account, signer, relayer };
}
