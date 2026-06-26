import type { Network } from "@buckspay/core";

/** Minimal structural type of the kit the signer needs (avoids a value import). */
export interface WalletsKitLike {
  setWallet(id: string): void;
  getAddress(): Promise<{ address: string }>;
  signAuthEntry(
    preimageXdr: string,
    opts: { address: string; networkPassphrase?: string }
  ): Promise<{ signedAuthEntry: string }>;
  signTransaction(
    txXdr: string,
    opts: { address: string; networkPassphrase?: string }
  ): Promise<{ signedTxXdr: string }>;
}

// `typeof import(...)` types the loader against the REAL library surface, so a
// renamed export upstream (e.g. LobstrModule) breaks typecheck instead of failing
// at runtime. consistent-type-imports flags inline import() types generically;
// here it's the correct idiom for a runtime dynamic-import loader.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type KitLoader = () => Promise<typeof import("@creit.tech/stellar-wallets-kit")>;

const defaultLoader: KitLoader = () => import("@creit.tech/stellar-wallets-kit");

export interface KitOptions {
  network: Network;
  selectedWalletId?: string;
}

/**
 * Resolve the wallets kit. An already-built kit may be injected (production: the
 * app builds + connects it once; tests: a mock). Otherwise the real library is
 * dynamically imported — it is browser-only (touches `window` at module eval),
 * so the import is lazy and never runs during SSR/Node unless explicitly hit.
 * Freighter/xBull/LOBSTR modules are registered (README §4.6).
 */
export async function resolveKit(
  opts: KitOptions,
  injected?: WalletsKitLike,
  loader: KitLoader = defaultLoader
): Promise<WalletsKitLike> {
  if (injected) return injected;

  const mod = await loader();
  const { StellarWalletsKit, WalletNetwork, FreighterModule, xBullModule, LobstrModule, FREIGHTER_ID } =
    mod;

  // The real StellarWalletsKit instance is structurally a WalletsKitLike
  // (setWallet/getAddress/signAuthEntry), so no assertion is needed.
  return new StellarWalletsKit({
    network: opts.network === "pubnet" ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
    selectedWalletId: opts.selectedWalletId ?? FREIGHTER_ID,
    modules: [new FreighterModule(), new xBullModule(), new LobstrModule()]
  });
}
