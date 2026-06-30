[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / GasAbstractionEngine

# Class: GasAbstractionEngine

Defined in: [packages/core/src/gas-abstraction-engine.ts:13](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/gas-abstraction-engine.ts#L13)

Maps a signed intent into the relayer request body for the configured gas
strategy. v1 supports `sponsored` only: the facilitator's sponsor account
pays the XLM fee, so the body carries no fee/token-payment fields.

The gas mode is validated once at construction; v1 keeps no instance state
because `sponsored` projection is fixed. The token / self gas modes will store
the config and branch on it inside `toRelayPayload`.

## Constructors

### Constructor

> **new GasAbstractionEngine**(`gas`): `GasAbstractionEngine`

Defined in: [packages/core/src/gas-abstraction-engine.ts:14](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/gas-abstraction-engine.ts#L14)

#### Parameters

##### gas

[`GasConfig`](../type-aliases/GasConfig.md)

#### Returns

`GasAbstractionEngine`

## Methods

### toRelayPayload()

> **toRelayPayload**(`signed`): [`RelayPayload`](../interfaces/RelayPayload.md)

Defined in: [packages/core/src/gas-abstraction-engine.ts:38](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/gas-abstraction-engine.ts#L38)

Project a signed intent into the facilitator relay body. In `sponsored`
mode this is exactly the seven fields of `stellarSorobanSchema`; the
intent-only `network` field is intentionally dropped (the relayer is
already network-bound). Output is byte-identical to the dashboard's
`SorobanRelayBody` - enforced by the golden test.

#### Parameters

##### signed

[`SignedIntent`](../interfaces/SignedIntent.md)

#### Returns

[`RelayPayload`](../interfaces/RelayPayload.md)
