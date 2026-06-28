// React hooks — full pay component. Compiles against @types/react 19 + the real hook types.
import { useMemo, type CSSProperties } from "react";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import { useWallet, useStellarPay } from "@buckspay/react";
import type { Call } from "@buckspay/core";

const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const MERCHANT = "GA6HCMBLTZS5VYYBCATRBR5VBZJEH5C2OON6XQGB3RNYDDAQ7JZ65YQH";
const btn: CSSProperties = { padding: "0.75rem 1.25rem", borderRadius: 8, cursor: "pointer" };

export function PayButton() {
  const { wallet, address, connect, status: wStatus, error: wErr } = useWallet();
  const { pay, status, receipt, error } = useStellarPay();

  const transferCall = useMemo<Call | null>(() => {
    if (!address) return null;
    return {
      contract: USDC_SAC,
      fn: "transfer",
      args: [new Address(address).toScVal(), new Address(MERCHANT).toScVal(), nativeToScVal(15000000n, { type: "i128" })]
    };
  }, [address]);

  const busy = status === "signing" || status === "relaying";
  const shownError = error ?? wErr;

  if (!wallet) {
    return (
      <button onClick={() => void connect()} style={btn} disabled={wStatus === "connecting"} aria-live="polite">
        {wStatus === "connecting" ? "Connecting…" : "Connect"}
      </button>
    );
  }
  return (
    <div>
      <button onClick={() => transferCall && void pay([transferCall])} style={btn} disabled={busy || !transferCall}>
        {busy ? "Paying…" : "Pay 1.50 USDC (free)"}
      </button>
      {receipt && <p aria-live="polite">settled: {receipt.transferTx}</p>}
      {shownError && (
        <p role="alert">
          {shownError.code}: {shownError.message}
        </p>
      )}
    </div>
  );
}
