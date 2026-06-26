/**
 * Closed union of every error condition the SDK surfaces. Facilitator and RPC
 * failures are mapped onto these codes by the relayer/account adapters; the
 * consumer never sees a raw upstream error string.
 */
export type BuckspayErrorCode =
  | "SIGNATURE_REJECTED"
  | "AUTH_EXPIRED"
  | "SIMULATION_FAILED"
  | "ACCOUNT_NOT_READY"
  | "RELAYER_REJECTED"
  | "RELAYER_UNREACHABLE"
  | "INSUFFICIENT_SPONSOR"
  | "INSUFFICIENT_BALANCE"
  | "INVALID_CONFIG"
  | "UNKNOWN";

/**
 * The single error type thrown across `@buckspay/*`. Carries a machine-readable
 * `code` for branching and preserves the originating `cause` for diagnostics
 * (never log raw addresses — see security standards).
 */
export class BuckspayError extends Error {
  readonly code: BuckspayErrorCode;

  constructor(code: BuckspayErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.code = code;
    this.name = "BuckspayError";
    // Restore the prototype chain for transpiled `extends Error` so `instanceof`
    // stays correct across bundle (ESM/CJS) boundaries.
    Object.setPrototypeOf(this, BuckspayError.prototype);
  }
}
