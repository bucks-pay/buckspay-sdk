import { Networks } from "@stellar/stellar-sdk";
import {
  BuckspayError,
  type AuthEntryPayload,
  type BuckspaySigner,
  type Network,
  type Signature,
  type SignerKey
} from "@buckspay/core";
import { resolveKit, type KitOptions, type WalletsKitLike } from "./kit-factory.js";
import { normalizeSignature } from "./normalize-signature.js";

function passphraseFor(network: Network): string {
  return network === "pubnet" ? Networks.PUBLIC : Networks.TESTNET;
}

/**
 * Build a `BuckspaySigner` backed by Stellar Wallets Kit (Freighter/xBull/LOBSTR).
 *
 * Holds only the connected `G...` public key and the 64-byte signatures the wallet
 * returns - never a secret. The kit and address are memoized per signer instance,
 * so a signer is safe to construct once and reuse across many sign cycles. An
 * already-built kit may be injected (production app or tests); otherwise the
 * browser-only library is lazily imported on first use.
 */
export function walletsKit(opts: KitOptions, injected?: WalletsKitLike): BuckspaySigner {
  let kitPromise: Promise<WalletsKitLike> | null = null;
  const getKit = (): Promise<WalletsKitLike> => {
    kitPromise ??= resolveKit(opts, injected);
    return kitPromise;
  };

  let cachedAddress: string | null = null;
  const getAddress = async (): Promise<string> => {
    if (cachedAddress) return cachedAddress;
    const kit = await getKit();
    try {
      const { address } = await kit.getAddress();
      cachedAddress = address;
      return address;
    } catch (cause) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "wallet is not connected", { cause });
    }
  };

  return {
    type: "wallets-kit",

    async getPublicKey(): Promise<SignerKey> {
      const publicKey = await getAddress();
      return { type: "ed25519", publicKey };
    },

    async signAuthEntry(payload: AuthEntryPayload): Promise<Signature> {
      const kit = await getKit();
      const address = await getAddress();
      let signedAuthEntry: string;
      try {
        const res = await kit.signAuthEntry(payload.preimageXdr, {
          address,
          networkPassphrase: passphraseFor(payload.network)
        });
        signedAuthEntry = res.signedAuthEntry;
      } catch (cause) {
        throw new BuckspayError("SIGNATURE_REJECTED", "wallet rejected the signature", { cause });
      }
      const signature = normalizeSignature(signedAuthEntry);
      return { signature, publicKey: address };
    },

    async signTransaction(txXdr: string, ctx: { network: Network; address: string }): Promise<string> {
      // Classic sponsored onboarding signs the full sponsor-sandwich transaction
      // (not an auth-entry). The kit's SEP-43 signTransaction returns the signed
      // envelope XDR; the wallet holds the key, the SDK only passes XDR through.
      const kit = await getKit();
      try {
        const { signedTxXdr } = await kit.signTransaction(txXdr, {
          address: ctx.address,
          networkPassphrase: passphraseFor(ctx.network)
        });
        return signedTxXdr;
      } catch (cause) {
        throw new BuckspayError("SIGNATURE_REJECTED", "wallet rejected the transaction signature", {
          cause
        });
      }
    }
  };
}
