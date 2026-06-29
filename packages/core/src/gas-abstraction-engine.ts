import { BuckspayError } from "./errors";
import type { GasConfig, RelayPayload, SignedIntent } from "./types";

/**
 * Maps a signed intent into the relayer request body for the configured gas
 * strategy. v1 supports `sponsored` only: the facilitator's sponsor account
 * pays the XLM fee, so the body carries no fee/token-payment fields.
 *
 * The gas mode is validated once at construction; v1 keeps no instance state
 * because `sponsored` projection is fixed. SP-2 (token / self) will store the
 * config and branch on it inside `toRelayPayload`.
 */
export class GasAbstractionEngine {
  constructor(gas: GasConfig) {
    // Defensive: a JS consumer can pass a mode the type system can't guarantee,
    // so widen to `string` before comparing (the literal type would make the
    // guard look unreachable to the type checker).
    const mode: string = (gas as { mode: string }).mode;
    // `sponsored` is fully implemented. `token` (SP-2 sprint-1, FeeForwarder) is an
    // ACCEPTED config that fails closed downstream in `BuckspayClient.prepare`
    // (TOKEN_GAS_REJECTED) until sprint-1 wires it — so the feature gate lives where
    // the feature will be built, not here. Any other mode is rejected at construction.
    if (mode !== "sponsored" && mode !== "token") {
      throw new BuckspayError(
        "INVALID_CONFIG",
        `unsupported gas mode "${mode}"; supported: "sponsored", "token"`
      );
    }
  }

  /**
   * Project a signed intent into the facilitator relay body. In `sponsored`
   * mode this is exactly the seven fields of `stellarSorobanSchema`; the
   * intent-only `network` field is intentionally dropped (the relayer is
   * already network-bound). Output is byte-identical to the dashboard's
   * `SorobanRelayBody` — enforced by the golden test.
   */
  toRelayPayload(signed: SignedIntent): RelayPayload {
    return {
      token: signed.token,
      from: signed.from,
      to: signed.to,
      value: signed.value,
      authorizationEntryXdr: signed.authorizationEntryXdr,
      nonce: signed.nonce,
      signatureExpirationLedger: signed.signatureExpirationLedger
    };
  }
}
