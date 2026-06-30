import { useMemo } from "react";
import { SafeAreaView, View, Text, Pressable, ActivityIndicator } from "react-native";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import { BuckspayProvider, useWallet, useStellarPay } from "@buckspay/react-native";
import type { Call } from "@buckspay/core";
import { config, sim, USDC_SAC, MERCHANT } from "./src/config";

function PayScreen() {
  const { wallet, address, connect, status: wStatus, error: wErr } = useWallet();
  const { pay, status, receipt, error } = useStellarPay();

  const transferCall = useMemo<Call | null>(() => {
    if (!address) return null;
    return {
      contract: USDC_SAC,
      fn: "transfer",
      args: [
        new Address(address).toScVal(),
        new Address(MERCHANT).toScVal(),
        nativeToScVal(15000000n, { type: "i128" })
      ]
    };
  }, [address]);

  const busy = status === "signing" || status === "relaying";
  const shownError = error ?? wErr;

  return (
    <SafeAreaView>
      <View style={{ padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>Buckspay · gasless USDC</Text>
        {!wallet ? (
          <Pressable accessibilityRole="button" onPress={() => void connect()} disabled={wStatus === "connecting"}>
            <Text>{wStatus === "connecting" ? "Connecting…" : "Connect with passkey"}</Text>
          </Pressable>
        ) : (
          <>
            <Text>Account: {address}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => transferCall && void pay([transferCall])}
              disabled={busy || !transferCall}
            >
              {busy ? <ActivityIndicator /> : <Text>Pay 1.50 USDC (free)</Text>}
            </Pressable>
            {receipt && <Text accessibilityLiveRegion="polite">settled: {receipt.transferTx}</Text>}
          </>
        )}
        {shownError && (
          <Text accessibilityRole="alert">
            {shownError.code}: {shownError.message}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <BuckspayProvider config={config} sim={sim}>
      <PayScreen />
    </BuckspayProvider>
  );
}
