import { z } from "zod";
import { receiptSchema, type Receipt, type RelayPayload } from "./sign-local.js";

const accountStateSchema = z.object({
  exists: z.boolean(),
  hasUsdcTrustline: z.boolean(),
  usdcBalance: z.union([z.string(), z.null()]).optional(),
  nativeBalance: z.union([z.string(), z.null()]).optional()
});
export type AccountState = z.infer<typeof accountStateSchema>;

const onboardBuildSchema = z.object({
  ok: z.boolean(),
  nothingToDo: z.boolean().optional(),
  unsignedTxXdr: z.string().optional(),
  sponsor: z.string().optional()
});
export type OnboardBuild = z.infer<typeof onboardBuildSchema>;

const onboardSubmitSchema = z.object({
  ok: z.boolean(),
  txHash: z.string().optional(),
  ledger: z.union([z.number(), z.null()]).optional()
});
export type OnboardSubmit = z.infer<typeof onboardSubmitSchema>;

export type FacilitatorChain = "stellar-testnet" | "stellar-pubnet";

export interface FacilitatorClientOpts {
  baseUrl: string;
  apiKey: string;
  chain: FacilitatorChain;
}

export class FacilitatorClient {
  constructor(private readonly opts: FacilitatorClientOpts) {}

  private headers(): Record<string, string> {
    return { "Content-Type": "application/json", "x-api-key": this.opts.apiKey };
  }

  private async readError(res: Response): Promise<never> {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = { error: "non_json_error", status: res.status };
    }
    const e = body as { error?: string; message?: string };
    throw new Error(`facilitator ${res.status}: ${e.error ?? "error"}${e.message ? ` — ${e.message}` : ""}`);
  }

  async getAccountState(publicKey: string): Promise<AccountState> {
    const url = `${this.opts.baseUrl}/stellar/account/${publicKey}?chain=${this.opts.chain}`;
    const res = await fetch(url, { method: "GET", headers: this.headers() });
    if (!res.ok) return this.readError(res);
    return accountStateSchema.parse(await res.json());
  }

  async onboardBuild(publicKey: string): Promise<OnboardBuild> {
    const url = `${this.opts.baseUrl}/stellar/onboard/build`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ publicKey, chain: this.opts.chain })
    });
    if (!res.ok) return this.readError(res);
    return onboardBuildSchema.parse(await res.json());
  }

  async onboardSubmit(publicKey: string, signedTxXdr: string): Promise<OnboardSubmit> {
    const url = `${this.opts.baseUrl}/stellar/onboard/submit`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ publicKey, chain: this.opts.chain, signedTxXdr })
    });
    if (!res.ok) return this.readError(res);
    return onboardSubmitSchema.parse(await res.json());
  }

  async relay(payload: RelayPayload): Promise<Receipt> {
    const url = `${this.opts.baseUrl}/relay`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) return this.readError(res);
    return receiptSchema.parse(await res.json());
  }
}
