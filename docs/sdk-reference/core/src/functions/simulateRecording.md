[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / simulateRecording

# Function: simulateRecording()

> **simulateRecording**(`input`): `Promise`\<[`RecordingResult`](../interfaces/RecordingResult.md)\>

Defined in: [packages/core/src/auth-entry-builder.ts:195](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/auth-entry-builder.ts#L195)

Run a recording simulation to obtain the auth entries/footprint for `call`.
The simulator throwing, or returning zero auth entries, is a SIMULATION_FAILED
(the transfer would revert or records no auth). Base64 entries are decoded to
typed XDR for the caller; never trust unparsed RPC output downstream.

## Parameters

### input

#### call

[`Call`](../interfaces/Call.md)

#### from

`string`

#### network

[`Network`](../type-aliases/Network.md)

#### simulator

[`SorobanSimulator`](../interfaces/SorobanSimulator.md)

## Returns

`Promise`\<[`RecordingResult`](../interfaces/RecordingResult.md)\>
