export interface RnFlowInput {
  platform: "ios" | "android";
  appBinary: string;
}
export interface RnFlowResult {
  address: string;
  receiptTx: string;
  chain: string;
}

/**
 * Drives the example app on a simulator. Implementation note (CI): use Detox (`detox test`) with a
 * virtual WebAuthn authenticator on the iOS simulator, or Maestro (`maestro test`) flows on both
 * platforms. The flow: install `appBinary`, launch, tap the `accessibilityRole="button"`
 * "Connect with passkey" → approve the virtual authenticator → tap "Pay 1.50 USDC (free)" → scrape
 * the "settled: <tx>" live region. This scaffold throws until a runner with a simulator is
 * provisioned; the gated test that calls it is skipped meanwhile.
 */
export function driveRnPayFlow(_input: RnFlowInput): Promise<RnFlowResult> {
  return Promise.reject(
    new Error(
      "rn-driver: simulator driver not provisioned in this environment. Set BUCKSPAY_E2E_RN=1 " +
        "with a Detox/Maestro runner (see e2e/README.md) to enable the RN smoke."
    )
  );
}
