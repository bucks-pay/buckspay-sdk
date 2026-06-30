// Recipe 16 - EMAIL / OTP LOGIN -> gasless USDC. Browser app.
//
// The user enters their email, receives a one-time code, and verifies it. The OTP backend
// and the derived ed25519 key are custodied by the facilitator; the browser only ever sees
// the public key + signatures, reached through YOUR signer-proxy. No secret ships client-side.
import { createBuckspayClient, createRpcSimContext, type BuckspayConfig } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { emailSigner } from "@buckspay/signers/email";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const USDC_SAC_TESTNET = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const MERCHANT = "GA6HCMBLTZS5VYYBCATRBR5VBZJEH5C2OON6XQGB3RNYDDAQ7JZ65YQH";

const signer = emailSigner({
  // YOUR same-origin signer-proxy route; forwards to the facilitator with creds server-side.
  proxyUrl: "/api/buckspay/auth/email",
  network: "testnet"
});

export const emailConfig: BuckspayConfig = {
  network: "testnet",
  account: classicAccount(),
  signer,
  relayer: buckspayFacilitator({ url: "/api/buckspay/relay", network: "testnet" }),
  gas: { mode: "sponsored" }
};

export const emailClient = createBuckspayClient(
  emailConfig,
  createRpcSimContext("https://soroban-testnet.stellar.org")
);

export async function payWithEmailLogin(email: string, otpFromInbox: string): Promise<void> {
  // 1. Issue the code (UI then collects it from the user's inbox).
  await signer.requestOtp(email);
  // 2. Verify the code -> resolves the custodied Stellar ed25519 key.
  const details = await signer.authenticate?.({ email, otp: otpFromInbox });
  console.log("signed in as", details?.publicKey, "via", details?.provider);

  // 3. Ordinary gasless payment - accounts/relayer/engine are untouched.
  await emailClient.connect();
  const call = emailClient.transfer({ token: USDC_SAC_TESTNET, to: MERCHANT, amount: "2.00" });
  const receipt = await emailClient.pay([call]);
  console.log(receipt.transferTx);
}
