import { describe, it, expect } from "vitest";
import { RN_E2E_ENABLED, e2eEnv } from "./env.js";

/**
 * RN simulator smoke. GATED: runs only when BUCKSPAY_E2E_RN=1 AND a platform + app binary are
 * present, so `pnpm test` never drives a device. The driver (Detox or Maestro — see e2e/README.md)
 * launches the example app on the simulator, registers a virtual WebAuthn authenticator, taps
 * Connect → Pay, and reads the settled receipt off-screen. We assert the user-visible contract
 * here; the platform driver lives behind `RN_E2E_PLATFORM`.
 */
describe.skipIf(!RN_E2E_ENABLED)("react-native passkey → gasless pay (SIMULATOR smoke)", () => {
  it("connects with a virtual passkey, pays USDC gasless, and shows a settled receipt", async () => {
    const { driveRnPayFlow } = await import("./rn-driver.js"); // Detox/Maestro adapter
    const result = await driveRnPayFlow({
      platform: e2eEnv.RN_E2E_PLATFORM!,
      appBinary: e2eEnv.RN_E2E_APP_BINARY!
    });
    expect(result.address).toMatch(/^C[A-Z2-7]{55}$/); // OZ contract account
    expect(result.receiptTx).toMatch(/^[0-9a-f]{64}$/); // settled testnet tx hash
    expect(result.chain).toBe("stellar-testnet");
  }, 180_000);
});
