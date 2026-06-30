# @buckspay/nextjs

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
