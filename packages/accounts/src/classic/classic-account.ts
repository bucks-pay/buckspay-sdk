import { Address, authorizeEntry, Networks } from "@stellar/stellar-sdk";
import type { SigningCallback, xdr } from "@stellar/stellar-sdk";
import { BuckspayError, buildUnsignedEntry as coreBuildUnsignedEntry } from "@buckspay/core";
import type {
  AccountAdapter,
  AssembleInput,
  BuildEntryInput,
  BuckspaySigner,
  EnsureReadyInput,
  Network
} from "@buckspay/core";

function passphraseFor(network: Network): string {
  return network === "pubnet" ? Networks.PUBLIC : Networks.TESTNET;
}

type SignTxFn = (txXdr: string, opts: { network: Network; address: string }) => Promise<string>;

/**
 * wallets-kit signers also sign full onboarding transactions (the sponsor
 * sandwich), exposed via the optional `signTransaction` member of BuckspaySigner
 * (web3-stellar/wallet.signStellarTx). Passkey signers omit it — they cannot
 * sign a classic `G…` transaction — so the classic onboarding path rejects them.
 * Returns a stable bound reference (narrowing of an optional method does not
 * survive the `await` between build and submit).
 */
function resolveTxSigner(signer: BuckspaySigner): SignTxFn | null {
  // `typeof` narrows in the condition; `.bind` keeps a stable, this-correct
  // reference (both forms keep eslint's unbound-method rule satisfied).
  return typeof signer.signTransaction === "function" ? signer.signTransaction.bind(signer) : null;
}

/**
 * Classic (`G…`) account adapter — the strangler extraction of the dashboard's
 * `web3-stellar/{sign,onboard,wallet}.ts` behind the core `AccountAdapter` port.
 * Holds no key material: both the onboarding tx and the auth-entry are signed
 * inside the wallet via the injected `BuckspaySigner`.
 */
export function classicAccount(): AccountAdapter {
  return {
    model: "classic",

    async resolveAddress(signer: BuckspaySigner): Promise<string> {
      const { publicKey } = await signer.getPublicKey();
      return publicKey;
    },

    async ensureReady(input: EnsureReadyInput): Promise<void> {
      const { address, relayer, signer, network } = input;

      const state = await relayer.getAccountState(address);
      if (state.exists && state.hasUsdcTrustline) return; // already onboarded — no-op

      const signTransaction = resolveTxSigner(signer);
      if (!signTransaction) {
        throw new BuckspayError(
          "ACCOUNT_NOT_READY",
          "classic onboarding requires a wallet that can sign a full transaction"
        );
      }

      let signedTxXdr: string;
      try {
        // Mirror onboard.ts: build the sponsor-sandwich tx, sign it in the wallet.
        const { xdr: unsignedTxXdr } = await relayer.buildOnboard({ publicKey: address });
        signedTxXdr = await signTransaction(unsignedTxXdr, { network, address });
      } catch (cause) {
        throw new BuckspayError("ACCOUNT_NOT_READY", "onboarding signature failed", { cause });
      }

      const { ok } = await relayer.submitOnboard({ publicKey: address, signedTxXdr });
      if (!ok) {
        throw new BuckspayError("ACCOUNT_NOT_READY", "onboarding submission was rejected");
      }
    },

    buildUnsignedEntry(input: BuildEntryInput): xdr.SorobanAuthorizationEntry {
      const { from, call, nonce } = input;

      // Translate the core `Call` (token/fn/args) into the byte-exact builder's
      // params. core.buildUnsignedEntry rebuilds the args verbatim from the
      // dashboard port, preserving the Sprint 3 byte-parity invariant.
      const toArg = call.args[1];
      const amountArg = call.args[2];
      if (!toArg || !amountArg) {
        throw new BuckspayError(
          "INVALID_CONFIG",
          "classic transfer requires (from, to, amount) args"
        );
      }
      return coreBuildUnsignedEntry({
        sac: call.contract,
        from,
        to: Address.fromScVal(toArg).toString(),
        stroops: BigInt(amountArg.i128().lo().toString()),
        nonce
      });
    },

    async assembleSignedEntry(input: AssembleInput): Promise<string> {
      const { unsigned, signer, signatureExpirationLedger, network } = input;

      // Mirror dashboard web3-stellar/sign.ts (lines 131-143): the wallet signs
      // the HashIDPreimage and returns the 64-byte ed25519 signature + G-address.
      const signingCallback: SigningCallback = async (preimage) => {
        const { signature, publicKey } = await signer.signAuthEntry({
          preimageXdr: preimage.toXDR("base64"),
          network,
          signatureExpirationLedger
        });
        if (signature.length !== 64) {
          throw new BuckspayError(
            "SIGNATURE_REJECTED",
            `unexpected signature length ${String(signature.length)}`
          );
        }
        return { signature: Buffer.from(signature), publicKey };
      };

      const signed = await authorizeEntry(
        unsigned,
        signingCallback,
        signatureExpirationLedger,
        passphraseFor(network)
      );
      return signed.toXDR("base64");
    }
  };
}
