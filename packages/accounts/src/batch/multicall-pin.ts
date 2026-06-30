import { BuckspayError } from "@buckspay/core";
import type { Network } from "@buckspay/core";

/**
 * Pinned Multicall router C-address per network. The Multicall contract is sponsored-installed
 * once per network (hash-pinned `97b8f81a…`, like the OZ smart-account + FeeForwarder wasm) and
 * its `batch_transfer(payer, token, Vec<(to, amount)>)` entrypoint settles an atomic batch.
 *
 *  - testnet: deployed + proven on-chain by the sprint-0/03 multicall spike (DECISION.md = GO).
 *  - pubnet:  empty until the facilitator deploys + pins it (sprint-2/02) — a pubnet batch then
 *             fails closed with INVALID_CONFIG rather than using a wrong/testnet router.
 *
 * A caller may override per-call via `ozContractAccount({ multicallContract })` /
 * `classicAccount({ multicallContract })`. No `process.env` read (the SDK runs in browsers).
 */
export const MULTICALL_CONTRACT_ID: Record<Network, string> = {
  testnet: "CA7IDT4KNINZDOGCHU4AZVXW5ENYATOTX3RRNTIUBRGCS2JXX5SVGJKY",
  pubnet: ""
};

export function resolveMulticallContract(network: Network, override?: string): string {
  const addr = override ?? MULTICALL_CONTRACT_ID[network];
  if (!/^C[A-Z2-7]{55}$/.test(addr)) {
    throw new BuckspayError(
      "INVALID_CONFIG",
      `contract batch needs a Multicall router C-address for ${network}; pass ozContractAccount({ multicallContract }) / classicAccount({ multicallContract })`
    );
  }
  return addr;
}
