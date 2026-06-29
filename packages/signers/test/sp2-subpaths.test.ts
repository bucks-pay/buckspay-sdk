import { describe, expect, it } from "vitest";
import * as social from "../src/social/index";
import * as email from "../src/email/index";

describe("SP-2 signer subpath scaffolds", () => {
  it("social subpath module loads (factory arrives in sprint-4)", () => {
    expect(social).toBeDefined();
    expect("socialSigner" in social).toBe(false); // not implemented yet — sprint-4
  });
  it("email subpath module loads (factory arrives in sprint-4)", () => {
    expect(email).toBeDefined();
    expect("emailSigner" in email).toBe(false);
  });
});
