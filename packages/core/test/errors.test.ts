import { describe, expect, it } from "vitest";
import { BuckspayError, type BuckspayErrorCode } from "../src/errors";

describe("BuckspayError", () => {
  it("is an instance of Error and BuckspayError", () => {
    const err = new BuckspayError("UNKNOWN", "boom");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(BuckspayError);
  });

  it("sets a readonly code and message", () => {
    const err = new BuckspayError("SIGNATURE_REJECTED", "user said no");
    expect(err.code).toBe("SIGNATURE_REJECTED");
    expect(err.message).toBe("user said no");
  });

  it("sets the error name to BuckspayError", () => {
    const err = new BuckspayError("AUTH_EXPIRED", "too late");
    expect(err.name).toBe("BuckspayError");
  });

  it("preserves the cause when provided", () => {
    const root = new Error("root cause");
    const err = new BuckspayError("RELAYER_UNREACHABLE", "no socket", { cause: root });
    expect(err.cause).toBe(root);
  });

  it("leaves cause undefined when not provided", () => {
    const err = new BuckspayError("UNKNOWN", "no cause");
    expect(err.cause).toBeUndefined();
  });

  it("accepts every documented error code (exhaustive)", () => {
    const codes: BuckspayErrorCode[] = [
      "SIGNATURE_REJECTED",
      "AUTH_EXPIRED",
      "SIMULATION_FAILED",
      "ACCOUNT_NOT_READY",
      "RELAYER_REJECTED",
      "RELAYER_UNREACHABLE",
      "INSUFFICIENT_SPONSOR",
      "INSUFFICIENT_BALANCE",
      "INVALID_CONFIG",
      "UNKNOWN"
    ];
    for (const code of codes) {
      expect(new BuckspayError(code, code).code).toBe(code);
    }
    expect(codes).toHaveLength(10);
  });

  it("serializes the code in a thrown/caught flow", () => {
    try {
      throw new BuckspayError("SIMULATION_FAILED", "recording sim reverted");
    } catch (e) {
      expect(e).toBeInstanceOf(BuckspayError);
      expect((e as BuckspayError).code).toBe("SIMULATION_FAILED");
    }
  });
});
