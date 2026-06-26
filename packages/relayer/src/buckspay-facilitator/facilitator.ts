import {
  BuckspayError,
  type AccountState,
  type Network,
  type Receipt,
  type RelayPayload,
  type Relayer
} from "@buckspay/core";
import {
  accountStateSchema,
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

    async getAccountState(address: string): Promise<AccountState> {
      const data = await request(`/stellar/account/${address}?chain=${chain}`, { method: "GET" });
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

    // Non-async + Promise.reject (not a synchronous throw) so callers get a
    // rejected promise, matching the Relayer contract. Wired in Sprint 4 / oz-contract.
    deployContract(): Promise<{ address: string }> {
      return Promise.reject(
        new BuckspayError(
          "INVALID_CONFIG",
          "deployContract is not available in SP-1 sprint 2 (implemented in Sprint 4 / oz-contract)"
        )
      );
    }
  };
}
