[**buckspay-sdk**](../../README.md)

***

[buckspay-sdk](../../README.md) / core/src

# core/src

## Classes

- [BuckspayClient](classes/BuckspayClient.md)
- [BuckspayError](classes/BuckspayError.md)
- [GasAbstractionEngine](classes/GasAbstractionEngine.md)

## Interfaces

- [AccountAdapter](interfaces/AccountAdapter.md)
- [AccountSimContext](interfaces/AccountSimContext.md)
- [AccountState](interfaces/AccountState.md)
- [AssembleInput](interfaces/AssembleInput.md)
- [AuthDetails](interfaces/AuthDetails.md)
- [AuthEntryPayload](interfaces/AuthEntryPayload.md)
- [BatchBuilder](interfaces/BatchBuilder.md)
- [BuckspayConfig](interfaces/BuckspayConfig.md)
- [BuckspaySigner](interfaces/BuckspaySigner.md)
- [BuckspayState](interfaces/BuckspayState.md)
- [BuckspayWallet](interfaces/BuckspayWallet.md)
- [BuildBatchEntryInput](interfaces/BuildBatchEntryInput.md)
- [BuildEntryInput](interfaces/BuildEntryInput.md)
- [Call](interfaces/Call.md)
- [EnsureReadyInput](interfaces/EnsureReadyInput.md)
- [FeeQuote](interfaces/FeeQuote.md)
- [PreparedIntent](interfaces/PreparedIntent.md)
- [Receipt](interfaces/Receipt.md)
- [RecordingResult](interfaces/RecordingResult.md)
- [Relayer](interfaces/Relayer.md)
- [RelayPayload](interfaces/RelayPayload.md)
- [Session](interfaces/Session.md)
- [SessionGrant](interfaces/SessionGrant.md)
- [SessionInstallInput](interfaces/SessionInstallInput.md)
- [SessionManager](interfaces/SessionManager.md)
- [SessionManagerDeps](interfaces/SessionManagerDeps.md)
- [SessionRevokeInput](interfaces/SessionRevokeInput.md)
- [Signature](interfaces/Signature.md)
- [SignedIntent](interfaces/SignedIntent.md)
- [SignerKey](interfaces/SignerKey.md)
- [SorobanSimulateRaw](interfaces/SorobanSimulateRaw.md)
- [SorobanSimulator](interfaces/SorobanSimulator.md)
- [SubInvocation](interfaces/SubInvocation.md)
- [SwapQuote](interfaces/SwapQuote.md)
- [SwapQuoteRequest](interfaces/SwapQuoteRequest.md)
- [SwapRequest](interfaces/SwapRequest.md)

## Type Aliases

- [AccountModel](type-aliases/AccountModel.md)
- [BuckspayErrorCode](type-aliases/BuckspayErrorCode.md)
- [FacilitatorChain](type-aliases/FacilitatorChain.md)
- [GasConfig](type-aliases/GasConfig.md)
- [Network](type-aliases/Network.md)
- [RpcFetch](type-aliases/RpcFetch.md)
- [SessionPolicy](type-aliases/SessionPolicy.md)
- [SignerType](type-aliases/SignerType.md)
- [SwapChain](type-aliases/SwapChain.md)

## Variables

- [MAX\_BATCH\_CALLS](variables/MAX_BATCH_CALLS.md)
- [USDC\_DECIMALS](variables/USDC_DECIMALS.md)

## Functions

- [batch](functions/batch.md)
- [buildUnsignedCallEntry](functions/buildUnsignedCallEntry.md)
- [buildUnsignedEntry](functions/buildUnsignedEntry.md)
- [createBuckspayClient](functions/createBuckspayClient.md)
- [createBuckspayConfig](functions/createBuckspayConfig.md)
- [createRpcSimContext](functions/createRpcSimContext.md)
- [createSessionManager](functions/createSessionManager.md)
- [createSorobanSimulator](functions/createSorobanSimulator.md)
- [deserializeSession](functions/deserializeSession.md)
- [getLatestLedger](functions/getLatestLedger.md)
- [mainnetSimContext](functions/mainnetSimContext.md)
- [randomNonce](functions/randomNonce.md)
- [serializeSession](functions/serializeSession.md)
- [sessionId](functions/sessionId.md)
- [simulateRecording](functions/simulateRecording.md)
- [toStroops](functions/toStroops.md)
