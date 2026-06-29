import { describe, expect, it } from "vitest";
import * as rn from "../src/index";

describe("@buckspay/react-native scaffold", () => {
  it("re-exports the React hooks/provider (RN-wired in sprint-5, no core fork)", () => {
    expect(typeof rn.BuckspayProvider).toBe("function");
    expect(typeof rn.useWallet).toBe("function");
    expect(typeof rn.useStellarPay).toBe("function");
  });
  it("nativePasskey + secure storage arrive in sprint-5", () => {
    expect("nativePasskey" in rn).toBe(false);
  });
});
