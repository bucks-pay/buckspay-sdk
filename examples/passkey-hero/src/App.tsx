import { useMemo, type CSSProperties } from "react";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import { useWallet, useStellarPay } from "@buckspay/react";
import type { Call } from "@buckspay/core";

const USDC = import.meta.env.VITE_USDC_SAC as string;
const MERCHANT = import.meta.env.VITE_MERCHANT_G as string;
const AMOUNT_STROOPS = 100000n; // 0.01 USDC (7 decimals)
const EXPLORER = "https://stellar.expert/explorer/testnet/tx/";

const btn: CSSProperties = { padding: "0.75rem 1.25rem", fontSize: "1rem", borderRadius: 8, cursor: "pointer" };

export function App() {
  const { wallet, address, connect, status: wStatus, error: wErr } = useWallet();
  const { pay, status, receipt, error } = useStellarPay();

  // NOTE: the hooks don't expose `client.transfer` yet, so we build the Call here.
  // A future `useStellarPay().transfer({token,to,amount})` helper would remove this.
  const transferCall = useMemo<Call | null>(() => {
    if (!address) return null;
    return {
      contract: USDC,
      fn: "transfer",
      args: [
        new Address(address).toScVal(),
        new Address(MERCHANT).toScVal(),
        nativeToScVal(AMOUNT_STROOPS, { type: "i128" })
      ]
    };
  }, [address]);

  const busy = status === "signing" || status === "relaying";
  const shownError = error ?? wErr;

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 480, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>buckspay — pay with a passkey, gas-free</h1>
      <p aria-live="polite">
        {wStatus !== "idle" ? `wallet: ${wStatus}` : "ready"}
        {status !== "idle" ? ` · pay: ${status}` : ""}
      </p>

      {!wallet ? (
        <button onClick={() => void connect()} style={btn} disabled={wStatus === "connecting"}>
          {wStatus === "connecting" ? "Creating wallet…" : "Create wallet with Face ID"}
        </button>
      ) : (
        <>
          <p>
            Wallet (<code>{wallet.model}</code>): <code>{address}</code>
          </p>
          <button onClick={() => transferCall && void pay([transferCall])} style={btn} disabled={busy || !transferCall}>
            {busy ? "Paying…" : "Pay 0.01 USDC (free)"}
          </button>
        </>
      )}

      {receipt && (
        <p>
          ✅ Settled —{" "}
          <a href={`${EXPLORER}${receipt.transferTx}`} target="_blank" rel="noreferrer">
            {receipt.transferTx.slice(0, 12)}…
          </a>
        </p>
      )}
      {shownError && (
        <p role="alert" style={{ color: "crimson" }}>
          {shownError.code}: {shownError.message}
        </p>
      )}
    </main>
  );
}
