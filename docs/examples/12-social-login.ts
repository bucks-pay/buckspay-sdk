// Recipe 12 - SOCIAL LOGIN (web3auth) -> gasless USDC. Browser app.
//
// The user signs in with Google/Apple/Discord via web3auth. The PUBLIC OAuth runs in the
// browser; the SECRET verifier callback is completed by YOUR backend's signer-proxy
// (`@buckspay/nextjs` createSignerProxyRoute -> facilitator POST /auth/social). web3auth
// hands back a Stellar ed25519 key - the smart-account signer. No web3auth secret and no
// private key ever reach this bundle.
import { createBuckspayClient, createRpcSimContext, type BuckspayConfig } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { socialSigner } from "@buckspay/signers/social";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const USDC_SAC_TESTNET = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const MERCHANT = "GA6HCMBLTZS5VYYBCATRBR5VBZJEH5C2OON6XQGB3RNYDDAQ7JZ65YQH";

// The social ed25519 key backs the classic account (its G-address IS the account).
const signer = socialSigner({
  provider: "web3auth",
  clientId: "BNxxxx-your-web3auth-client-id",
  network: "testnet",
  // YOUR same-origin signer-proxy route; it forwards to the facilitator with the secret server-side.
  proxyUrl: "/api/buckspay/auth/social"
});

export const socialConfig: BuckspayConfig = {
  network: "testnet",
  account: classicAccount(),
  signer,
  // url points at YOUR backend relay route (apiKey server-side), never the raw facilitator key.
  relayer: buckspayFacilitator({ url: "/api/buckspay/relay", network: "testnet" }),
  gas: { mode: "sponsored" }
};

export const socialClient = createBuckspayClient(
  socialConfig,
  createRpcSimContext("https://soroban-testnet.stellar.org")
);

export async function payWithSocialLogin(): Promise<void> {
  // 1. Run the provider OAuth flow -> resolves the Stellar ed25519 key.
  const details = await signer.authenticate?.({ loginProvider: "google" });
  console.log("signed in as", details?.publicKey, "via", details?.provider);

  // 2. From here it is an ordinary gasless payment - accounts/relayer/engine are untouched.
  await socialClient.connect();
  const call = socialClient.transfer({ token: USDC_SAC_TESTNET, to: MERCHANT, amount: "1.50" });
  const receipt = await socialClient.pay([call]);
  console.log(receipt.transferTx);
}
