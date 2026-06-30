import { describe, expect, it } from "vitest";
import * as rn from "../src/index";

describe("@buckspay/react-native scaffold", () => {
  it("re-exports the React hooks/provider (RN-wired in sprint-5, no core fork)", () => {
    expect(typeof rn.BuckspayProvider).toBe("function");
    expect(typeof rn.useWallet).toBe("function");
    expect(typeof rn.useStellarPay).toBe("function");
  });
  it("ships nativePasskey + the SecureStore port", () => {
    expect(typeof rn.nativePasskey).toBe("function");
    expect(typeof rn.memorySecureStore).toBe("function");
  });
});
