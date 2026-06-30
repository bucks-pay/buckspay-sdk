---
title: "core/src"
---

# core/src

## Classes

- [BuckspayClient](/sdk-reference/core/src/classes/BuckspayClient)
- [BuckspayError](/sdk-reference/core/src/classes/BuckspayError)
- [GasAbstractionEngine](/sdk-reference/core/src/classes/GasAbstractionEngine)

## Interfaces

- [AccountAdapter](/sdk-reference/core/src/interfaces/AccountAdapter)
- [AccountSimContext](/sdk-reference/core/src/interfaces/AccountSimContext)
- [AccountState](/sdk-reference/core/src/interfaces/AccountState)
- [AssembleInput](/sdk-reference/core/src/interfaces/AssembleInput)
- [AuthDetails](/sdk-reference/core/src/interfaces/AuthDetails)
- [AuthEntryPayload](/sdk-reference/core/src/interfaces/AuthEntryPayload)
- [BatchBuilder](/sdk-reference/core/src/interfaces/BatchBuilder)
- [BuckspayConfig](/sdk-reference/core/src/interfaces/BuckspayConfig)
- [BuckspaySigner](/sdk-reference/core/src/interfaces/BuckspaySigner)
- [BuckspayState](/sdk-reference/core/src/interfaces/BuckspayState)
- [BuckspayWallet](/sdk-reference/core/src/interfaces/BuckspayWallet)
- [BuildBatchEntryInput](/sdk-reference/core/src/interfaces/BuildBatchEntryInput)
- [BuildEntryInput](/sdk-reference/core/src/interfaces/BuildEntryInput)
- [Call](/sdk-reference/core/src/interfaces/Call)
- [EnsureReadyInput](/sdk-reference/core/src/interfaces/EnsureReadyInput)
- [FeeQuote](/sdk-reference/core/src/interfaces/FeeQuote)
- [PreparedIntent](/sdk-reference/core/src/interfaces/PreparedIntent)
- [Receipt](/sdk-reference/core/src/interfaces/Receipt)
- [RecordingResult](/sdk-reference/core/src/interfaces/RecordingResult)
- [Relayer](/sdk-reference/core/src/interfaces/Relayer)
- [RelayPayload](/sdk-reference/core/src/interfaces/RelayPayload)
- [Session](/sdk-reference/core/src/interfaces/Session)
- [SessionGrant](/sdk-reference/core/src/interfaces/SessionGrant)
- [SessionInstallInput](/sdk-reference/core/src/interfaces/SessionInstallInput)
- [SessionManager](/sdk-reference/core/src/interfaces/SessionManager)
- [SessionManagerDeps](/sdk-reference/core/src/interfaces/SessionManagerDeps)
- [SessionRevokeInput](/sdk-reference/core/src/interfaces/SessionRevokeInput)
- [Signature](/sdk-reference/core/src/interfaces/Signature)
- [SignedIntent](/sdk-reference/core/src/interfaces/SignedIntent)
- [SignerKey](/sdk-reference/core/src/interfaces/SignerKey)
- [SorobanSimulateRaw](/sdk-reference/core/src/interfaces/SorobanSimulateRaw)
- [SorobanSimulator](/sdk-reference/core/src/interfaces/SorobanSimulator)
- [SubInvocation](/sdk-reference/core/src/interfaces/SubInvocation)
- [SwapQuote](/sdk-reference/core/src/interfaces/SwapQuote)
- [SwapQuoteRequest](/sdk-reference/core/src/interfaces/SwapQuoteRequest)
- [SwapRequest](/sdk-reference/core/src/interfaces/SwapRequest)

## Type Aliases

- [AccountModel](/sdk-reference/core/src/type-aliases/AccountModel)
- [BuckspayErrorCode](/sdk-reference/core/src/type-aliases/BuckspayErrorCode)
- [FacilitatorChain](/sdk-reference/core/src/type-aliases/FacilitatorChain)
- [GasConfig](/sdk-reference/core/src/type-aliases/GasConfig)
- [Network](/sdk-reference/core/src/type-aliases/Network)
- [RpcFetch](/sdk-reference/core/src/type-aliases/RpcFetch)
- [SessionPolicy](/sdk-reference/core/src/type-aliases/SessionPolicy)
- [SignerType](/sdk-reference/core/src/type-aliases/SignerType)
- [SwapChain](/sdk-reference/core/src/type-aliases/SwapChain)

## Variables

- [MAX\_BATCH\_CALLS](/sdk-reference/core/src/variables/MAX_BATCH_CALLS)
- [USDC\_DECIMALS](/sdk-reference/core/src/variables/USDC_DECIMALS)

## Functions

- [batch](/sdk-reference/core/src/functions/batch)
- [buildUnsignedCallEntry](/sdk-reference/core/src/functions/buildUnsignedCallEntry)
- [buildUnsignedEntry](/sdk-reference/core/src/functions/buildUnsignedEntry)
- [createBuckspayClient](/sdk-reference/core/src/functions/createBuckspayClient)
- [createBuckspayConfig](/sdk-reference/core/src/functions/createBuckspayConfig)
- [createRpcSimContext](/sdk-reference/core/src/functions/createRpcSimContext)
- [createSessionManager](/sdk-reference/core/src/functions/createSessionManager)
- [createSorobanSimulator](/sdk-reference/core/src/functions/createSorobanSimulator)
- [deserializeSession](/sdk-reference/core/src/functions/deserializeSession)
- [getLatestLedger](/sdk-reference/core/src/functions/getLatestLedger)
- [mainnetSimContext](/sdk-reference/core/src/functions/mainnetSimContext)
- [randomNonce](/sdk-reference/core/src/functions/randomNonce)
- [serializeSession](/sdk-reference/core/src/functions/serializeSession)
- [sessionId](/sdk-reference/core/src/functions/sessionId)
- [simulateRecording](/sdk-reference/core/src/functions/simulateRecording)
- [toStroops](/sdk-reference/core/src/functions/toStroops)
