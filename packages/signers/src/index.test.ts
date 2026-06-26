import { describe, it, expect } from "vitest";
import { version } from "./index.js";
import { version as walletsKitVersion } from "./wallets-kit.js";
import { version as passkeyVersion } from "./passkey.js";

describe("@buckspay/signers", () => {
  it("root and subpaths export string versions", () => {
    expect(typeof version).toBe("string");
    expect(typeof walletsKitVersion).toBe("string");
    expect(typeof passkeyVersion).toBe("string");
  });
});
