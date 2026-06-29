import { Address, hash, nativeToScVal, Networks, xdr } from "@stellar/stellar-sdk";
import {
  randomNonce as defaultRandomNonce,
  simulateRecording,
  toStroops,
  type SorobanSimulator
} from "./auth-entry-builder";
import { GasAbstractionEngine } from "./gas-abstraction-engine";
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
 * and a current-ledger source. Sprint 2 supplies the real RPC-backed pair on
 * the account adapter wiring; tests inject a deterministic context.
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
    // SP-2: gas mode "token" lands in sprint-1 (FeeForwarder). Until then, fail closed so a
    // token config can never silently fall through to the sponsored path.
    if (this.config.gas.mode === "token") {
      throw new BuckspayError(
        "TOKEN_GAS_REJECTED",
        "gas mode 'token' (fee in stablecoin) is not available until SP-2 sprint-1"
      );
    }
    const call = calls[0]; // v1: single transfer call (batch is SP-2)
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

    // recording simulation — fails closed on revert (e.g. insufficient balance)
    await simulateRecording({ from, call, network: this.config.network, simulator: this.sim.simulator });

    const latestLedger = await this.sim.getLatestLedger();
    const signatureExpirationLedger = boundExpirationLedger(latestLedger, latestLedger + EXPIRY_LEDGER_DELTA);

    const unsignedEntry = this.config.account.buildUnsignedEntry({ from, call, nonce });

    // value = the i128 transfer amount from the call's 3rd arg (lo bits; USDC stroops fit in 64 bits).
    const toArg = call.args[1];
    const amountArg = call.args[2];
    if (!toArg || !amountArg) {
      throw new BuckspayError("INVALID_CONFIG", "transfer call must include (from, to, amount) args");
    }
    const value = amountArg.i128().lo().toString();
    const to = Address.fromScVal(toArg).toString();

    const preimageXdr = this.toPreimageXdr(unsignedEntry, signatureExpirationLedger);

    return {
      from,
      to,
      token: call.contract,
      value,
      nonce: nonce.toString(),
      signatureExpirationLedger,
      network: this.config.network,
      unsignedEntry,
      preimageXdr
    };
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
    return {
      from: intent.from,
      to: intent.to,
      token: intent.token,
      value: intent.value,
      nonce: intent.nonce,
      signatureExpirationLedger: intent.signatureExpirationLedger,
      network: intent.network,
      authorizationEntryXdr
    };
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
