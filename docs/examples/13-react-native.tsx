// Recipe 13 - REACT NATIVE. The mobile binding re-exports the SAME @buckspay/react hooks and only
// swaps the signer (native passkey / secure enclave), storage, and Hermes polyfills. The screen
// logic is identical to web (recipe 05); only the host components (<View>/<Text>) and the signer
// differ. This example pins the @buckspay/react-native surface; the View/Text layer is the app's,
// so it is omitted here (it would pull react-native intrinsics) - fragments stand in for it.
import {
  BuckspayProvider,
  useWallet,
  useStellarPay,
  nativePasskey,
  memorySecureStore,
  type SecureStore
} from "@buckspay/react-native";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";
import { createRpcSimContext, type BuckspayConfig, type Call } from "@buckspay/core";

const SPONSOR_G = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const MERCHANT = "GA6HCMBLTZS5VYYBCATRBR5VBZJEH5C2OON6XQGB3RNYDDAQ7JZ65YQH";

// Same config shape as web - the ONLY mobile-specific line is the native passkey signer.
export const mobileConfig: BuckspayConfig = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR_G }),
  signer: nativePasskey({ rpId: "app.buckspay.dev", rpName: "buckspay" }),
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  gas: { mode: "sponsored" }
};

// Session blobs / credential ids persist via a SecureStore port (keychain/expo on device).
export const store: SecureStore = memorySecureStore();

// The hooks are byte-identical to @buckspay/react - no fork (recipe 05).
export function PayScreen() {
  const { wallet, address, connect } = useWallet();
  const { pay, status, receipt } = useStellarPay();

  if (!wallet) {
    // On device this is a <Pressable onPress={connect}> inside a <View>.
    return <>{"Connect"}</>;
  }
  const call: Call = {
    contract: USDC_SAC,
    fn: "transfer",
    args: [] // built from address -> MERCHANT in the real screen; see recipe 05
  };
  void address;
  void (() => pay([call]));
  return <>{status === "success" && receipt ? `settled: ${receipt.transferTx}` : "Pay 1.50 USDC (free)"}</>;
}

// Wrap the tree once, exactly like web - pass `sim` so useStellarPay().pay() can simulate.
export function App() {
  return (
    <BuckspayProvider config={mobileConfig} sim={createRpcSimContext("https://soroban-testnet.stellar.org")}>
      <PayScreen />
    </BuckspayProvider>
  );
}
