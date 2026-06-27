import { describe, it, expect } from "vitest";
import { passkey } from "../../src/passkey/index.js";

describe("passkey factory", () => {
  it("returns a BuckspaySigner of type passkey", () => {
    const signer = passkey({ rpId: "buckspay.local" });
    expect(signer.type).toBe("passkey");
    expect(typeof signer.getPublicKey).toBe("function");
    expect(typeof signer.signAuthEntry).toBe("function");
  });
  it("throws INVALID_CONFIG when rpId is empty", () => {
    expect(() => passkey({ rpId: "" })).toThrow(/rpId/);
  });
});
