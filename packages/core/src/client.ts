import { Address, hash, nativeToScVal, Networks, xdr } from "@stellar/stellar-sdk";
import {
  buildUnsignedCallEntry,
  randomNonce as defaultRandomNonce,
  simulateRecording,
  toStroops,
  type SorobanSimulator
} from "./auth-entry-builder";
import { GasAbstractionEngine } from "./gas-abstraction-engine";
import { MAX_BATCH_CALLS } from "./batch";
import { boundExpirationLedger } from "./expiration";
import { resolveNetwork } from "./network-gate";
import { BuckspayError } from "./errors";
import type {
  AccountState,
  BuckspayConfig,
  BuckspayWallet,
  Call,
  Network,
  PreparedIntent,
  Receipt,
  SignedIntent
} from "./types";

/**
 * Capabilities the client needs to `prepare` an intent: a recording simulator
 * and a current-ledger source. The account adapter wiring supplies the real
 * RPC-backed pair; tests inject a deterministic context.
 */
export interface AccountSimContext {
  simulator: SorobanSimulator;
  getLatestLedger: () => Promise<number>;
  randomNonce?: () => bigint;
}

const PASSPHRASE: Record<Network, string> = {
  testnet: Networks.TESTNET,
  pubnet: Networks.PUBLIC
};

/** Matches the dashboard's `currentLedger + 60` signing window. */
const EXPIRY_LEDGER_DELTA = 60;

export class BuckspayClient {
  private readonly config: BuckspayConfig;
  private readonly engine: GasAbstractionEngine;
  private readonly sim: AccountSimContext | null;
  private address: string | null = null;

  constructor(config: BuckspayConfig, sim?: AccountSimContext) {
    // Mainnet gate: pubnet is refused unless a deliberate opt-in is present, so a
    // default/forgotten config cannot move real funds. Two equivalent signals, ORed:
    //   - Node env `BUCKSPAY_ALLOW_MAINNET=1` (servers / CI), and
    //   - config `allowMainnet: true` (browsers, which have no `process.env`).
    // `resolveNetwork` stays the single gate — this only computes the boolean it takes.
    const envOptIn = typeof process !== "undefined" && process.env.BUCKSPAY_ALLOW_MAINNET === "1";
    const allowMainnet = envOptIn || config.allowMainnet === true;
    resolveNetwork(config.network, { allowMainnet });
    this.config = config;
    this.engine = new GasAbstractionEngine(config.gas);
    this.sim = sim ?? null;
  }

  async connect(): Promise<BuckspayWallet> {
    const { account, signer, relayer, network } = this.config;
    const address = await account.resolveAddress(signer);
    await account.ensureReady({ address, relayer, signer, network });
    this.address = address;
    return {
      address,
      model: account.model,
      getState: () => relayer.getAccountState(address)
    };
  }

  async getAccountState(address?: string): Promise<AccountState> {
    const target = address ?? this.address;
    if (!target) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "no address; call connect() first");
    }
    return this.config.relayer.getAccountState(target);
  }

  transfer(opts: { token: string; to: string; amount: string | bigint }): Call {
    if (!this.address) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "not connected; call connect() before transfer()");
    }
    const stroops = typeof opts.amount === "bigint" ? opts.amount : toStroops(opts.amount);
    return {
      contract: opts.token,
      fn: "transfer",
      args: [
        new Address(this.address).toScVal(),
        new Address(opts.to).toScVal(),
        nativeToScVal(stroops, { type: "i128" })
      ]
    };
  }

  async prepare(calls: Call[]): Promise<PreparedIntent> {
    // An atomic batch routes through prepareBatch. The single-call path below is
    // left BYTE-IDENTICAL to the original single-call (sponsored) path (a batch of 1 never reaches prepareBatch).
    if (calls.length > 1) return this.prepareBatch(calls);
    const call = calls[0]; // v1 single-transfer path — byte-identical to the original sponsored path, untouched
    if (!call) {
      throw new BuckspayError("INVALID_CONFIG", "prepare() requires at least one call");
    }
    if (!this.address) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "not connected; call connect() before prepare()");
    }
    if (!this.sim) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "no simulation context wired");
    }
    const from = this.address;
    const nonce = (this.sim.randomNonce ?? defaultRandomNonce)();

    // value/to = the underlying payment (the user's transfer call: from, to, amount).
    const toArg = call.args[1];
    const amountArg = call.args[2];
    if (!toArg || !amountArg) {
      throw new BuckspayError("INVALID_CONFIG", "transfer call must include (from, to, amount) args");
    }
    const value = amountArg.i128().lo().toString();
    const to = Address.fromScVal(toArg).toString();

    const latestLedger = await this.sim.getLatestLedger();
    const signatureExpirationLedger = boundExpirationLedger(latestLedger, latestLedger + EXPIRY_LEDGER_DELTA);

    const base = {
      from,
      to,
      token: call.contract,
      value,
      nonce: nonce.toString(),
      signatureExpirationLedger,
      network: this.config.network
    };

    const gas = this.config.gas;
    if (gas.mode === "token") {
      // gas-in-token: the user pays Soroban gas in `gas.token`. The SDK
      // does NOT relay the direct transfer — it relays a SINGLE FeeForwarder `forward(...)` invocation
      // that pays the merchant AND the relayer's gas in one auth entry. The facilitator quotes the fee +
      // forwarder + collector; the user signs ONE entry whose tree is forward() + the two sub-transfers.
      const relayer = this.config.relayer;
      if (!relayer.feeQuote) {
        throw new BuckspayError(
          "INVALID_CONFIG",
          "gas mode 'token' requires a relayer that implements feeQuote (POST /fee/quote)"
        );
      }
      const quote = await relayer.feeQuote({ from, token: gas.token, calls });

      // Refuse a quote above the ceiling BEFORE building/signing — the relayer can never charge more.
      if (gas.maxFee !== undefined && BigInt(quote.tokenAmount) > BigInt(gas.maxFee)) {
        throw new BuckspayError(
          "TOKEN_GAS_REJECTED",
          `fee quote ${quote.tokenAmount} exceeds maxFee ${gas.maxFee}`
        );
      }

      const payment = BigInt(value);
      const fee = BigInt(quote.tokenAmount);
      const fromScv = new Address(from).toScVal();
      const tokenScv = new Address(gas.token).toScVal();
      const merchantScv = new Address(to).toScVal();
      const collectorScv = new Address(quote.collector).toScVal();
      const paymentScv = nativeToScVal(payment, { type: "i128" });
      const feeScv = nativeToScVal(fee, { type: "i128" });

      const forwardArgs = [fromScv, tokenScv, merchantScv, paymentScv, collectorScv, feeScv];
      const forwardCall: Call = { contract: quote.forwarder, fn: "forward", args: forwardArgs };

      // Recording sim of the actual forward() call — fails closed if the payer can't afford payment + fee.
      await simulateRecording({
        from,
        call: forwardCall,
        network: this.config.network,
        simulator: this.sim.simulator
      });

      const unsignedEntry = buildUnsignedCallEntry({
        from,
        contract: quote.forwarder,
        fn: "forward",
        args: forwardArgs,
        nonce,
        // The forwarder performs two payer-authorized transfers; declare them so the SAC's
        // require_auth() is covered by this one auth tree (verified on-chain).
        subInvocations: [
          { contract: gas.token, fn: "transfer", args: [fromScv, merchantScv, paymentScv] },
          { contract: gas.token, fn: "transfer", args: [fromScv, collectorScv, feeScv] }
        ]
      });
      const preimageXdr = this.toPreimageXdr(unsignedEntry, signatureExpirationLedger);

      return { ...base, unsignedEntry, preimageXdr, feeQuote: quote };
    }

    // sponsored — byte-identical to the original single-call entry: the direct transfer entry, no fee fields.
    await simulateRecording({ from, call, network: this.config.network, simulator: this.sim.simulator });
    const unsignedEntry = this.config.account.buildUnsignedEntry({ from, call, nonce });
    const preimageXdr = this.toPreimageXdr(unsignedEntry, signatureExpirationLedger);

    return { ...base, unsignedEntry, preimageXdr };
  }

  async sign(intent: PreparedIntent): Promise<SignedIntent> {
    let authorizationEntryXdr: string;
    try {
      authorizationEntryXdr = await this.config.account.assembleSignedEntry({
        unsigned: intent.unsignedEntry,
        signer: this.config.signer,
        signatureExpirationLedger: intent.signatureExpirationLedger,
        network: intent.network
      });
    } catch (cause) {
      // The signer rejecting (wallet decline / passkey cancel) is the dominant
      // failure here; surface it as SIGNATURE_REJECTED with the cause preserved.
      throw new BuckspayError("SIGNATURE_REJECTED", "auth-entry signing failed or was rejected", {
        cause
      });
    }
    const signed: SignedIntent = {
      from: intent.from,
      to: intent.to,
      token: intent.token,
      value: intent.value,
      nonce: intent.nonce,
      signatureExpirationLedger: intent.signatureExpirationLedger,
      network: intent.network,
      authorizationEntryXdr
    };
    // gas mode "token": the signed authorizationEntryXdr IS the forward() entry — name the fee token so
    // the facilitator validates a forward() invocation. Sponsored intents carry no feeQuote → no feeToken.
    if (intent.feeQuote) {
      return { ...signed, feeToken: intent.feeQuote.token };
    }
    return signed;
  }

  async send(signed: SignedIntent): Promise<Receipt> {
    const payload = this.engine.toRelayPayload(signed);
    try {
      return await this.config.relayer.relay(payload);
    } catch (cause) {
      // Relayer adapters already throw typed BuckspayError; only wrap raw throws.
      if (cause instanceof BuckspayError) throw cause;
      throw new BuckspayError("RELAYER_REJECTED", "relayer rejected the payload", { cause });
    }
  }

  async pay(calls: Call[]): Promise<Receipt> {
    const intent = await this.prepare(calls);
    const signed = await this.sign(intent);
    return this.send(signed);
  }

  /** EIP-5792-style alias of pay(calls): submit an atomic, all-or-nothing batch. Enforces the
   *  MAX_BATCH_CALLS ceiling up front so an over-cap batch fails before any simulation or signing.
   *  A single call behaves exactly like pay([call]). */
  async sendCalls(calls: Call[]): Promise<Receipt> {
    if (calls.length > MAX_BATCH_CALLS) {
      throw new BuckspayError(
        "BATCH_TOO_LARGE",
        `sendCalls received ${String(calls.length)} calls; the per-tx limit is ${String(MAX_BATCH_CALLS)}`
      );
    }
    return this.pay(calls);
  }

  /**
   * Atomic multi-call prepare (calls.length > 1). One nonce, one expiration, one batched auth
   * entry (the Multicall `batch_transfer` invocation); the facilitator settles all-or-nothing
   * through the existing /relay. `value` = sum of transfer amounts, `to` = the LAST recipient —
   * the entry binds the exact list, so to/value are informational aggregates. Sponsored gas only
   * (batch + gas-in-token is a later combination). Fails closed over the ceiling BEFORE any work.
   */
  private async prepareBatch(calls: Call[]): Promise<PreparedIntent> {
    if (calls.length > MAX_BATCH_CALLS) {
      throw new BuckspayError(
        "BATCH_TOO_LARGE",
        `batch has ${String(calls.length)} calls; the per-tx limit is ${String(MAX_BATCH_CALLS)}`
      );
    }
    if (!this.address) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "not connected; call connect() before prepare()");
    }
    if (!this.sim) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "no simulation context wired");
    }
    const from = this.address;
    const nonce = (this.sim.randomNonce ?? defaultRandomNonce)();

    // Fail closed: every call's recording sim must succeed, else the whole batch reverts anyway.
    for (const call of calls) {
      await simulateRecording({ from, call, network: this.config.network, simulator: this.sim.simulator });
    }

    const latestLedger = await this.sim.getLatestLedger();
    const signatureExpirationLedger = boundExpirationLedger(latestLedger, latestLedger + EXPIRY_LEDGER_DELTA);
    const unsignedEntry = this.config.account.buildUnsignedBatchEntry({
      from,
      calls,
      nonce,
      network: this.config.network
    });

    let total = 0n;
    let lastTo = from;
    for (const call of calls) {
      const toArg = call.args[1];
      const amountArg = call.args[2];
      if (!toArg || !amountArg) {
        throw new BuckspayError("INVALID_CONFIG", "each batch transfer must include (from, to, amount) args");
      }
      total += BigInt(amountArg.i128().lo().toString());
      lastTo = Address.fromScVal(toArg).toString();
    }

    const firstCall = calls[0];
    if (!firstCall) {
      throw new BuckspayError("INVALID_CONFIG", "prepare() requires at least one call");
    }
    const preimageXdr = this.toPreimageXdr(unsignedEntry, signatureExpirationLedger);
    return {
      from,
      to: lastTo,
      token: firstCall.contract,
      value: total.toString(),
      nonce: nonce.toString(),
      signatureExpirationLedger,
      network: this.config.network,
      unsignedEntry,
      preimageXdr
    };
  }

  /** Build the HashIDPreimage the signer must sign (network id + nonce + entry). */
  private toPreimageXdr(entry: xdr.SorobanAuthorizationEntry, signatureExpirationLedger: number): string {
    const creds = entry.credentials().address();
    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId: hash(Buffer.from(PASSPHRASE[this.config.network])),
        nonce: creds.nonce(),
        signatureExpirationLedger,
        invocation: entry.rootInvocation()
      })
    );
    return preimage.toXDR("base64");
  }
}
