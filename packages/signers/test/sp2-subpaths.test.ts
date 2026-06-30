import { describe, expect, it } from "vitest";
import * as social from "../src/social/index";
import * as email from "../src/email/index";

describe("onboarding signer subpath scaffolds", () => {
  it("social subpath ships the socialSigner factory", () => {
    expect(social).toBeDefined();
    expect("socialSigner" in social).toBe(true);
    expect(typeof (social as { socialSigner: unknown }).socialSigner).toBe("function");
  });
  it("email subpath module loads (factory arrives later)", () => {
    expect(email).toBeDefined();
    expect("emailSigner" in email).toBe(false);
  });
});
