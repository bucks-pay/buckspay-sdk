import { describe, it, expect } from "vitest";
import { BuckspayError } from "@buckspay/core";
import { mapFacilitatorError } from "../src/buckspay-facilitator/internals";

describe("mapFacilitatorError — session codes", () => {
  it("session_policy_violation → SESSION_POLICY_VIOLATION", () => {
    const e = mapFacilitatorError(400, { error: "session_policy_violation", message: "spend limit exceeded" });
    expect(e).toBeInstanceOf(BuckspayError);
    expect(e.code).toBe("SESSION_POLICY_VIOLATION");
  });
  it("session_expired → SESSION_EXPIRED", () => {
    expect(mapFacilitatorError(400, { error: "session_expired", message: "signer expired" }).code).toBe(
      "SESSION_EXPIRED"
    );
  });
  it("an unrelated rejection still maps to RELAYER_REJECTED", () => {
    expect(mapFacilitatorError(400, { error: "recipient_not_allowed" }).code).toBe("RELAYER_REJECTED");
  });
});
