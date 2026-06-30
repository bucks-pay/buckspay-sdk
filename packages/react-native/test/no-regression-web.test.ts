import { describe, it, expect } from "vitest";
import * as web from "@buckspay/react";
import * as rn from "../src/index";

describe("web @buckspay/react is unaffected by the RN binding", () => {
  it("re-exports the identical provider/hooks (no shadowing, no wrapper)", () => {
    expect(rn.BuckspayProvider).toBe(web.BuckspayProvider);
    expect(rn.useWallet).toBe(web.useWallet);
    expect(rn.useStellarPay).toBe(web.useStellarPay);
  });
  it("the web binding's public surface is exactly its three hooks (unchanged by the RN binding)", () => {
    const surface = Object.keys(web).sort();
    expect(surface).toEqual(["BuckspayProvider", "useStellarPay", "useWallet"]);
  });
});
