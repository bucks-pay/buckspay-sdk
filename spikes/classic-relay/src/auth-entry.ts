import { Address, nativeToScVal, StrKey, xdr } from "@stellar/stellar-sdk";
import { z } from "zod";

/** "1.5" + 7 decimals -> 15000000n stroops. Ported from web3-stellar/sign.ts. */
export function toStroops(human: string, decimals: number): bigint {
  const [intPart, decRaw = ""] = human.split(".");
  const dec = decRaw.padEnd(decimals, "0").slice(0, decimals);
  return BigInt((intPart || "0") + dec);
}

/** Random nonce capped to 52 bits — the facilitator does Number(nonce); >2^53 loses precision. */
export function randomNonce(): bigint {
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  let v = 0n;
  for (const b of buf) v = (v << 8n) | BigInt(b);
  return v & 0x000fffffffffffffn;
}

const latestLedgerSchema = z.object({
  result: z.object({ sequence: z.number().int().nonnegative() }).optional(),
  error: z.object({ message: z.string() }).optional()
});

/** Soroban RPC getLatestLedger, response zod-validated. */
export async function getLatestLedger(rpcUrl: string): Promise<number> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLatestLedger" })
  });
  const data = latestLedgerSchema.parse(await res.json());
  if (data.error) throw new Error(`Soroban RPC: ${data.error.message}`);
  if (!data.result) throw new Error("Soroban RPC: missing result");
  return data.result.sequence;
}

export interface BuildEntryParams {
  sac: string;
  from: string;
  to: string;
  stroops: bigint;
  nonce: bigint;
}

/** Build the unsigned SorobanAuthorizationEntry for transfer(from,to,amount). Ported verbatim. */
export function buildUnsignedEntry(params: BuildEntryParams): xdr.SorobanAuthorizationEntry {
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
