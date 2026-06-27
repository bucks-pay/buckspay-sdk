import { describe, it, expect } from "vitest";
import * as api from "./index";

describe("@buckspay/react public surface", () => {
  it("exports exactly the three contracted members (README §4.6)", () => {
    expect(Object.keys(api).sort()).toEqual(["BuckspayProvider", "useStellarPay", "useWallet"]);
  });
});
