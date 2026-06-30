# @buckspay/nextjs

## 0.2.3

### Patch Changes

- @buckspay/core@0.2.3
- @buckspay/relayer@0.2.3

## 0.2.2

### Patch Changes

- 5188d94: **Next.js binding.** `@buckspay/nextjs` ships two App Router route-handler factories: `createRelayRoute`
  (the packaged same-origin BFF that forwards a signed intent to the facilitator with the apiKey
  server-side and returns the `Receipt`) and `createSignerProxyRoute` (forwards social/email bodies to the
  facilitator `/auth/*`, injecting the apiKey from server env). Both zod-validate request bodies and keep
  every secret out of the client bundle — the module is server-only and the apiKey never appears in any
  response. This completes the social + email onboarding loop end-to-end.
- Updated dependencies [a00a9ed]
  - @buckspay/core@0.2.2
  - @buckspay/relayer@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [ccc52f1]
- Updated dependencies [3a8497c]
  - @buckspay/core@0.2.1
  - @buckspay/relayer@0.2.1

## 0.2.0

### Patch Changes

- 282d74b: Additive type surface (the `sponsored | token` gas union, `FeeQuote` /
  `AuthDetails` / session / `SwapQuote` types, new `BuckspayError` codes, the optional
  `BuckspaySigner.authenticate`, optional fee fields on the intents/relay payload), the pure
  `batch()` builder + `MAX_BATCH_CALLS`, and buildable skeletons for the new `@buckspay/nextjs`
  and `@buckspay/react-native` packages plus the `signers/social`, `signers/email`, and
  `accounts/policy` subpaths. No behavior change to existing paths.
- Updated dependencies [3c577dc]
- Updated dependencies [9b6cabd]
- Updated dependencies [282d74b]
  - @buckspay/core@0.2.0
  - @buckspay/relayer@0.2.0
