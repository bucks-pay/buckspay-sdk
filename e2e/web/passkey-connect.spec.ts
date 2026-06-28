import { test, expect } from "@playwright/test";

test.skip(!process.env.BUCKSPAY_E2E, "set BUCKSPAY_E2E=1 to run web e2e");

test("create passkey wallet via virtual authenticator", async ({ page }) => {
  // Drive WebAuthn with a virtual authenticator over CDP so the passkey ceremony
  // runs unattended (no device, no human touch).
  const client = await page.context().newCDPSession(page);
  await client.send("WebAuthn.enable");
  const { authenticatorId } = await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true
    }
  });
  expect(authenticatorId).toBeTruthy();

  await page.goto("/");
  await page.getByRole("button", { name: /create wallet/i }).click();

  // connect() runs WebAuthn create() (passkey) + sponsored C-account deploy.
  await expect(page.getByText(/^C[A-Z2-7]{55}$/)).toBeVisible({ timeout: 90_000 });
  const creds = await client.send("WebAuthn.getCredentials", { authenticatorId });
  expect(creds.credentials.length).toBeGreaterThan(0);
});
