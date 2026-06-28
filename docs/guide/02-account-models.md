# Account models

buckspay separates *who signs* (`BuckspaySigner`) from *what account signs*
(`AccountAdapter`) — they are **orthogonal**. v1 ships two account models.

## Recipe A — classic wallet (`G…`)

For users who already have a Stellar wallet. `connect()` resolves the `G…` address and
runs sponsored onboarding (account + USDC trustline) if missing.

```ts
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
// account: classicAccount(), signer: walletsKit({ network: "testnet" })
```

Full compiled example: `docs/examples/02a-classic-account.ts`.

## Recipe B — passkey smart account (`C…`)

The hero flow. `connect()` creates the passkey (WebAuthn), derives the deterministic
C-address, and deploys the OpenZeppelin Smart Account **sponsored** by the facilitator.
Signing happens in the authenticator; the contract's `__check_auth` verifies the
secp256r1 signature **on-chain**.

```ts
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { passkey } from "@buckspay/signers/passkey";
// account: ozContractAccount({ network, sponsorAddress }),
// signer: passkey({ rpId: "app.buckspay.dev", rpName: "buckspay" })
```

Full compiled example: `docs/examples/02b-passkey-account.ts`. (`sponsorAddress` is the
facilitator's public sponsor account, needed to derive the C-address offline.)

## classic vs contract

| | classic | contract |
|---|---|---|
| User prerequisite | a Stellar wallet (Freighter/xBull/LOBSTR) | a device with a passkey/WebAuthn |
| Address | `G…` account | `C…` contract account |
| Materialization | sponsored onboarding (account + trustline) | sponsored OZ Smart Account deploy |
| Signature verified by | the network (Ed25519 auth) | the contract's `__check_auth` (secp256r1) |
| Best for | existing Stellar users | new users / passwordless onboarding |

The `AccountAdapter` interface is the seam — OZ Smart Accounts is the only v1 `contract`
impl, but you are not locked to a contract.

Prev: [Quickstart](./01-quickstart.md) · Next: [Gasless modes](./03-gasless-modes.md)
