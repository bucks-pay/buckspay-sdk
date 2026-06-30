# Buckspay SDK — end-to-end tests

All e2e suites are **gated** and skipped by default, so a plain `pnpm -r test` never reaches the
network or a device. Each lane has its own opt-in flag + secrets (env-driven, gitignored).

| Lane | Flag | What it drives |
|---|---|---|
| Testnet transfer / contract / gas-in-token / sessions | `BUCKSPAY_E2E=1` (+ secrets) | Live testnet through a local/remote facilitator |
| Mainnet smoke | `BUCKSPAY_E2E_MAINNET=1` (+ pubnet secrets) | Live pubnet (real funds — second-tier gate) |
| React Native simulator smoke | `BUCKSPAY_E2E_RN=1` (+ platform + app binary) | The Expo example app on a simulator/device |

The flags + their required env are the single source of truth in `src/env.ts`
(`E2E_ENABLED` / `MAINNET_ENABLED` / `RN_E2E_ENABLED`); the test files just `skipIf` on them.

## React Native simulator smoke

Drives `examples/react-native-pay/` through **connect (passkey) → gasless pay → settled receipt**
on a simulator/device. Separate from the unit/`pnpm -r test` lane so default CI stays device-free.

### Gate

```bash
BUCKSPAY_E2E_RN=1 \
RN_E2E_PLATFORM=ios \           # or: android
RN_E2E_APP_BINARY=/path/to/Buckspay.app \   # prebuilt .app (iOS) / .apk (Android)
pnpm --filter @buckspay/e2e exec vitest run src/rn-passkey.e2e.test.ts
```

With none of those set, the suite reports **1 skipped, 0 run**.

### Driver options (`src/rn-driver.ts`)

- **Detox** on a macOS runner with the iOS simulator + a **virtual WebAuthn authenticator** — the
  cleanest way to approve the passkey prompt deterministically in CI.
- **Maestro** flows for iOS **and** Android. For Android passkey hardware, run on a hosted **device
  farm** (AWS Device Farm / BrowserStack App Automate) where StrongBox-backed credentials work.

The flow taps the `accessibilityRole="button"` controls ("Connect with passkey", "Pay 1.50 USDC
(free)") and scrapes the "settled: <tx>" live region for the receipt.

### Prebuilding the example app

```bash
cd examples/react-native-pay
npx expo prebuild
npx expo run:ios --configuration Release    # produces the .app the driver installs
```

> This lane is intentionally outside `pnpm -r test`. The driver scaffold throws until a runner with
> a simulator is provisioned; the gated test is skipped until then.
