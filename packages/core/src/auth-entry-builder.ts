import { Address, nativeToScVal, StrKey, xdr } from "@stellar/stellar-sdk";
import { z } from "zod";
import { BuckspayError } from "./errors";
import type { Call, Network } from "./types";

/** USDC has 7 decimal places on Stellar. */
export const USDC_DECIMALS = 7;

/** "1.5" USDC -> 15000000n stroops (7 decimals). Ported from dashboard sign.ts. */
export function toStroops(human: string): bigint {
  const [intPart, decRaw = ""] = human.split(".");
  const dec = decRaw.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  // An empty integer part (e.g. ".5") must fall back to "0": `||` (falsy) is
  // intentional here, not `??` (nullish), which would leave "" in place.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return BigInt((intPart || "0") + dec);
}

/**
 * Crypto-random nonce capped to 52 bits. Ported from dashboard sign.ts.
 * The facilitator does `Number(nonce)`; values > 2^53 lose precision, so we
 * mask to 52 bits to stay inside the IEEE-754 safe-integer range.
 */
export function randomNonce(): bigint {
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  let v = 0n;
  for (const b of buf) v = (v << 8n) | BigInt(b);
  return v & 0x000fffffffffffffn;
}

/**
 * Build the unsigned USDC SAC `transfer` authorization entry. Ported verbatim
 * from dashboard sign.ts so the produced XDR is byte-identical to today's path.
 * Credentials bind to `from` (G… classic); `signatureExpirationLedger` and
 * `signature` stay zero/void until `authorizeEntry` (assemble step) fills them.
 */
export function buildUnsignedEntry(params: {
  sac: string;
  from: string;
  to: string;
  stroops: bigint;
  nonce: bigint;
}): xdr.SorobanAuthorizationEntry {
  const { sac, from, to, stroops, nonce } = params;
  const args = [
    new Address(from).toScVal(),
    new Address(to).toScVal(),
    nativeToScVal(stroops, { type: "i128" })
  ];
  const contractScAddress = Address.contract(StrKey.decodeContract(sac)).toScAddress();
  const contractFn = new xdr.InvokeContractArgs({
    contractAddress: contractScAddress,
    functionName: "transfer",
    args
  });
  const invocation = new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(contractFn),
    subInvocations: []
  });
  const credentials = new xdr.SorobanAddressCredentials({
    address: new Address(from).toScAddress(),
    nonce: xdr.Int64.fromString(nonce.toString()),
    signatureExpirationLedger: 0,
    signature: xdr.ScVal.scvVoid()
  });
  return new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(credentials),
    rootInvocation: invocation
  });
}

/** A nested authorized invocation: `contract.fn(args)`. Used to declare the sub-calls a contract makes
 *  on the signer's behalf (e.g. the FeeForwarder's two `transfer`s), so the SAC's `require_auth()` is
 *  covered by the same auth tree. */
export interface SubInvocation {
  contract: string;
  fn: string;
  args: xdr.ScVal[];
}

function authorizedContractFn(contract: string, fn: string, args: xdr.ScVal[]): xdr.SorobanAuthorizedInvocation {
  const contractFn = new xdr.InvokeContractArgs({
    contractAddress: Address.contract(StrKey.decodeContract(contract)).toScAddress(),
    functionName: fn,
    args
  });
  return new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(contractFn),
    subInvocations: []
  });
}

/**
 * Build an unsigned auth entry for an ARBITRARY contract call (generalizes `buildUnsignedEntry`, which
 * hardcodes `transfer`). Used by gas mode "token" to authorize the FeeForwarder `forward(...)` invocation
 * together with its `subInvocations` (the merchant + fee transfers the forwarder performs on the signer's
 * behalf — the entry tree must include them, verified against the sprint-0/02 fixture). Credentials bind to
 * `from`; `signatureExpirationLedger`/`signature` stay void until the assemble step.
 */
export function buildUnsignedCallEntry(params: {
  from: string;
  contract: string;
  fn: string;
  args: xdr.ScVal[];
  nonce: bigint;
  subInvocations?: SubInvocation[];
}): xdr.SorobanAuthorizationEntry {
  const { from, contract, fn, args, nonce, subInvocations = [] } = params;
  const invocation = new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      new xdr.InvokeContractArgs({
        contractAddress: Address.contract(StrKey.decodeContract(contract)).toScAddress(),
        functionName: fn,
        args
      })
    ),
    subInvocations: subInvocations.map((s) => authorizedContractFn(s.contract, s.fn, s.args))
  });
  const credentials = new xdr.SorobanAddressCredentials({
    address: new Address(from).toScAddress(),
    nonce: xdr.Int64.fromString(nonce.toString()),
    signatureExpirationLedger: 0,
    signature: xdr.ScVal.scvVoid()
  });
  return new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(credentials),
    rootInvocation: invocation
  });
}

export type RpcFetch = (input: string, init: RequestInit) => Promise<Response>;

const latestLedgerSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.number(), z.string()]),
  result: z.object({ sequence: z.number().int().nonnegative() }).optional(),
  error: z.object({ code: z.number(), message: z.string() }).optional()
});

/**
 * Fetch the current Soroban ledger sequence via JSON-RPC. The RPC response is
 * zod-validated before use; transport and protocol errors are mapped onto
 * BuckspayError codes (never thrown raw). `fetchImpl` is injectable for tests.
 */
export async function getLatestLedger(rpcUrl: string, fetchImpl: RpcFetch = fetch): Promise<number> {
  let raw: unknown;
  try {
    const res = await fetchImpl(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLatestLedger" })
    });
    raw = await res.json();
  } catch (cause) {
    throw new BuckspayError("RELAYER_UNREACHABLE", "Soroban RPC unreachable", { cause });
  }
  const parsed = latestLedgerSchema.safeParse(raw);
  if (!parsed.success) {
    throw new BuckspayError("RELAYER_UNREACHABLE", "Soroban RPC: malformed getLatestLedger response", {
      cause: parsed.error
    });
  }
  if (parsed.data.error) {
    throw new BuckspayError("RELAYER_UNREACHABLE", `Soroban RPC: ${parsed.data.error.message}`);
  }
  if (!parsed.data.result) {
    throw new BuckspayError("RELAYER_UNREACHABLE", "Soroban RPC: missing result");
  }
  return parsed.data.result.sequence;
}

/** Raw recording-simulation output: base64 auth entries + the min resource fee. */
export interface SorobanSimulateRaw {
  auth: string[]; // base64 SorobanAuthorizationEntry XDR (recording footprint)
  minResourceFee: string;
}

/** Narrow port over `rpc.Server.simulateTransaction`. Supplied by the account adapter. */
export interface SorobanSimulator {
  simulate(input: { from: string; call: Call; network: Network }): Promise<SorobanSimulateRaw>;
}

export interface RecordingResult {
  auth: xdr.SorobanAuthorizationEntry[];
  minResourceFee: string;
}

/**
 * Run a recording simulation to obtain the auth entries/footprint for `call`.
 * The simulator throwing, or returning zero auth entries, is a SIMULATION_FAILED
 * (the transfer would revert or records no auth). Base64 entries are decoded to
 * typed XDR for the caller; never trust unparsed RPC output downstream.
 */
export async function simulateRecording(input: {
  from: string;
  call: Call;
  network: Network;
  simulator: SorobanSimulator;
}): Promise<RecordingResult> {
  const { from, call, network, simulator } = input;
  let raw: SorobanSimulateRaw;
  try {
    raw = await simulator.simulate({ from, call, network });
  } catch (cause) {
    throw new BuckspayError("SIMULATION_FAILED", "recording simulation failed", { cause });
  }
  if (raw.auth.length === 0) {
    throw new BuckspayError("SIMULATION_FAILED", "recording simulation returned no auth entries");
  }
  let auth: xdr.SorobanAuthorizationEntry[];
  try {
    auth = raw.auth.map((b64) => xdr.SorobanAuthorizationEntry.fromXDR(b64, "base64"));
  } catch (cause) {
    throw new BuckspayError("SIMULATION_FAILED", "recording simulation returned invalid auth XDR", {
      cause
    });
  }
  return { auth, minResourceFee: raw.minResourceFee };
}
