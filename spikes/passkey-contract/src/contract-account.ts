import {
  Address,
  Keypair,
  nativeToScVal,
  Operation,
  rpc,
  StrKey,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
import { INCLUSION_FEE, sendAndConfirm } from "./wasm.js";

/** transfer(from,to,amount) args. `from` may be a C-address (contract account) — no trustline needed. */
export function buildTransferArgs(p: { from: string; to: string; stroops: bigint }): xdr.ScVal[] {
  return [
    new Address(p.from).toScVal(),
    new Address(p.to).toScVal(),
    nativeToScVal(p.stroops, { type: "i128" })
  ];
}

/** balance(address) args — Q2: the SAC tracks a C-address balance directly, no classic changeTrust. */
export function buildBalanceArgs(owner: string): xdr.ScVal[] {
  return [new Address(owner).toScVal()];
}

export interface DeployInput {
  rpcUrl: string;
  networkPassphrase: string;
  sponsor: Keypair;
  wasmHashHex: string;
  /** 65-byte uncompressed secp256r1 pubkey the account is bound to. */
  pubkey65: Uint8Array;
}

/**
 * Deploy an OZ Smart Account instance bound to the secp256r1 pubkey, sponsor-paid.
 * Uses createCustomContract with the installed Wasm hash and a constructor arg carrying
 * the pubkey. Returns the derived C-address.
 *
 * NOTE: the exact `constructorArgs` shape the OZ contract expects is confirmed live in the
 * Task 6 gate; if the constructor signature differs, the deploy simulation names the mismatch.
 */
export async function deployContractAccount(input: DeployInput): Promise<{ address: string }> {
  const { rpcUrl, networkPassphrase, sponsor, wasmHashHex, pubkey65 } = input;
  const server = new rpc.Server(rpcUrl, { allowHttp: rpcUrl.startsWith("http://") });
  const source = await server.getAccount(sponsor.publicKey());

  const op = Operation.createCustomContract({
    address: Address.fromString(sponsor.publicKey()),
    wasmHash: Buffer.from(wasmHashHex, "hex"),
    salt: Buffer.from(crypto.getRandomValues(new Uint8Array(32))),
    constructorArgs: [xdr.ScVal.scvBytes(Buffer.from(pubkey65))]
  });

  const tx = new TransactionBuilder(source, { fee: INCLUSION_FEE, networkPassphrase })
    .addOperation(op)
    .setTimeout(180)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(sponsor);
  const confirmed = await sendAndConfirm(server, prepared, "createCustomContract");
  const ret = confirmed.returnValue;
  if (!ret) throw new Error("deploy returned no value (expected the new contract address)");
  const address = Address.fromScVal(ret).toString();
  if (!StrKey.isValidContract(address)) throw new Error(`deploy returned a non-contract address: ${address}`);
  return { address };
}
