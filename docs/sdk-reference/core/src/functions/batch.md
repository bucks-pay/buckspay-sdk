[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / batch

# Function: batch()

> **batch**(...`calls`): [`BatchBuilder`](../interfaces/BatchBuilder.md)

Defined in: [packages/core/src/batch.ts:20](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/batch.ts#L20)

Pure, framework-agnostic call collector. The account adapter turns the returned calls
into one atomic entry (classic multi-op / contract Multicall).

## Parameters

### calls

...[`Call`](../interfaces/Call.md)[]

## Returns

[`BatchBuilder`](../interfaces/BatchBuilder.md)
