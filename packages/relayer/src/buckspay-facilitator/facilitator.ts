import {
  BuckspayError,
  type AccountState,
  type Call,
  type FeeQuote,
  type Network,
  type Receipt,
  type RelayPayload,
  type Relayer
} from "@buckspay/core";
import {
  accountStateSchema,
  deployContractSchema,
  feeQuoteSchema,
  mapFacilitatorError,
  onboardBuildSchema,
  onboardSubmitSchema,
  receiptSchema,
  toFacilitatorChain
} from "./internals.js";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface FacilitatorOptions {
  url: string;
  apiKey?: string;
  network: Network;
}

interface Deps {
  fetch?: FetchLike;
}

/**
 * Build a `Relayer` that talks to the buckspay facilitator. A thin, stateless,
 * injectable HTTP client: every response is zod-validated against the README §4.3
 * shapes before return, and HTTP/facilitator errors map to typed `BuckspayError`s.
 */
export function buckspayFacilitator(opts: FacilitatorOptions, deps: Deps = {}): Relayer {
  const baseUrl = opts.url.replace(/\/+$/, "");
  const chain = toFacilitatorChain(opts.network);
  const doFetch: FetchLike = deps.fetch ?? ((input, init) => fetch(input, init));

  function headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    // SERVER-SIDE ONLY: the raw apiKey is a secret. In the browser `opts.apiKey`
    // is undefined and the BFF injects the header — the key never reaches the bundle.
    if (opts.apiKey !== undefined && opts.apiKey !== "") h["x-api-key"] = opts.apiKey;
    return h;
  }

  async function request(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<unknown> {
    let res: Response;
    try {
      res = await doFetch(`${baseUrl}${path}`, {
        method: init.method,
        headers: headers(),
        ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {})
      });
    } catch (cause) {
      throw new BuckspayError("RELAYER_UNREACHABLE", `could not reach facilitator: ${path}`, { cause });
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch (cause) {
      if (!res.ok) throw mapFacilitatorError(res.status, {});
      throw new BuckspayError("RELAYER_REJECTED", `facilitator returned non-JSON for ${path}`, { cause });
    }

    if (!res.ok) {
      throw mapFacilitatorError(res.status, data ?? {});
    }
    return data;
  }

  return {
    async relay(payload: RelayPayload): Promise<Receipt> {
      const data = await request("/relay", { method: "POST", body: payload });
      const parsed = receiptSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("RELAYER_REJECTED", "facilitator returned an invalid receipt", {
          cause: parsed.error
        });
      }
      return parsed.data;
    },

    async feeQuote(input: { from: string; token: string; calls: Call[] }): Promise<FeeQuote> {
      // Serialize each ScVal arg to base64 so the body is JSON-safe; the facilitator decodes them
      // to rebuild the invocation, simulate it, and quote the XLM gas as a fee-token amount.
      const data = await request("/fee/quote", {
        method: "POST",
        body: {
          chain,
          from: input.from,
          token: input.token,
          calls: input.calls.map((c) => ({
            contract: c.contract,
            fn: c.fn,
            args: c.args.map((a) => a.toXDR("base64"))
          }))
        }
      });
      const parsed = feeQuoteSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("RELAYER_REJECTED", "facilitator returned an invalid fee quote", {
          cause: parsed.error
        });
      }
      return parsed.data;
    },

    async getAccountState(address: string): Promise<AccountState> {
      // Contract (C…) accounts read from /stellar/contract/:address; classic (G…) from
      // /stellar/account/:pk. Both return the same AccountState shape.
      const path = address.startsWith("C")
        ? `/stellar/contract/${address}?chain=${chain}`
        : `/stellar/account/${address}?chain=${chain}`;
      const data = await request(path, { method: "GET" });
      const parsed = accountStateSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("RELAYER_REJECTED", "facilitator returned invalid account state", {
          cause: parsed.error
        });
      }
      return parsed.data;
    },

    async buildOnboard(input: { publicKey: string }): Promise<{ xdr: string }> {
      const data = await request("/stellar/onboard/build", {
        method: "POST",
        body: { publicKey: input.publicKey, chain }
      });
      const parsed = onboardBuildSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("RELAYER_REJECTED", "facilitator returned invalid onboard build", {
          cause: parsed.error
        });
      }
      // `nothingToDo` (already onboarded) → no tx to sign.
      return { xdr: parsed.data.nothingToDo === true ? "" : (parsed.data.unsignedTxXdr ?? "") };
    },

    async submitOnboard(input: { publicKey: string; signedTxXdr: string }): Promise<{ ok: boolean }> {
      const data = await request("/stellar/onboard/submit", {
        method: "POST",
        body: { publicKey: input.publicKey, chain, signedTxXdr: input.signedTxXdr }
      });
      const parsed = onboardSubmitSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("RELAYER_REJECTED", "facilitator returned invalid onboard submit", {
          cause: parsed.error
        });
      }
      return { ok: parsed.data.ok };
    },

    async deployContract(input: { passkeyPublicKey: string }): Promise<{ address: string }> {
      // Sponsor-paid OZ smart-account deploy (plan 01). The SDK sends only the passkey
      // PUBLIC key + chain; the facilitator holds the sponsor secret and enforces the Wasm pin.
      const data = await request("/stellar/contract/deploy", {
        method: "POST",
        body: { passkeyPublicKey: input.passkeyPublicKey, chain }
      });
      const parsed = deployContractSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("RELAYER_REJECTED", "facilitator returned an invalid deploy response", {
          cause: parsed.error
        });
      }
      return { address: parsed.data.address };
    }
  };
}
