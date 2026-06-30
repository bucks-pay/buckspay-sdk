import { Address, xdr } from "@stellar/stellar-sdk";
import type { BuildEntryInput } from "@buckspay/core";

/**
 * Build the UNSIGNED `__check_auth` auth entry for a contract (C...) sender:
 * `SorobanCredentials::Address(C...)` + the `transfer` invocation. The expiration and
 * signature are placeholders set at assemble time.
 */
export function buildContractEntry(input: BuildEntryInput): xdr.SorobanAuthorizationEntry {
  const { from, call, nonce } = input;
  const credentials = xdr.SorobanCredentials.sorobanCredentialsAddress(
    new xdr.SorobanAddressCredentials({
      address: new Address(from).toScAddress(), // C... contract address
      nonce: xdr.Int64.fromString(nonce.toString()),
      signatureExpirationLedger: 0, // set at assemble time
      signature: xdr.ScVal.scvVoid() // filled at assemble time
    })
  );
  const rootInvocation = new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      new xdr.InvokeContractArgs({
        contractAddress: new Address(call.contract).toScAddress(),
        functionName: call.fn,
        args: call.args
      })
    ),
    subInvocations: []
  });
  return new xdr.SorobanAuthorizationEntry({ credentials, rootInvocation });
}
