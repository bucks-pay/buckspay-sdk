import { BuckspayError } from "./errors";
import type { Network } from "./types";

/**
 * Resolve and gate the network. Mainnet (pubnet) is refused unless the caller explicitly
 * opts in (env `BUCKSPAY_ALLOW_MAINNET=1` -> `allowMainnet: true`), so a default or
 * forgotten config cannot accidentally move real funds.
 */
export function resolveNetwork(network: Network, opts: { allowMainnet: boolean }): Network {
  if (network === "pubnet" && !opts.allowMainnet) {
    throw new BuckspayError(
      "INVALID_CONFIG",
      "mainnet (pubnet) is gated: set BUCKSPAY_ALLOW_MAINNET=1 to enable"
    );
  }
  return network;
}
