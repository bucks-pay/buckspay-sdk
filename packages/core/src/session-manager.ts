import { boundExpirationLedger } from "./expiration";
import { randomNonce as defaultRandomNonce } from "./auth-entry-builder";
import { BuckspayError } from "./errors";
import { sessionId } from "./session";
import type { AccountSimContext } from "./client";
import type {
  AccountAdapter,
  BuckspaySigner,
  Network,
  Receipt,
  Relayer,
  Session,
  SessionGrant,
  SessionManager,
  SessionPolicy
} from "./types";

/** Short signing window for the install/revoke transaction itself (matches the transfer delta). */
const INSTALL_EXPIRY_LEDGER_DELTA = 60;

export interface SessionManagerDeps {
  account: AccountAdapter;
  signer: BuckspaySigner;
  relayer: Relayer;
  network: Network;
  sim: AccountSimContext;
  address: string; // the connected smart-account C-address
  now: () => number; // injected clock (epoch ms) — the only time source
  randomNonce?: () => bigint;
}

/** Route a session install/revoke through the token registry: use the spend limit's token, else the
 *  account address. The call moves no value; this only picks the relay's dispatch token. */
function routingToken(policies: SessionPolicy[], fallback: string): string {
  const spend = policies.find((p): p is Extract<SessionPolicy, { kind: "spendLimit" }> => p.kind === "spendLimit");
  return spend ? spend.token : fallback;
}

export function createSessionManager(deps: SessionManagerDeps): SessionManager {
  const registry = new Map<string, Session>();

  function assertContract(): void {
    if (
      deps.account.model !== "contract" ||
      !deps.account.buildSessionInstallEntry ||
      !deps.account.buildSessionRevokeEntry
    ) {
      throw new BuckspayError(
        "INVALID_CONFIG",
        "sessions require the contract account model (the classic model has no policy signer)"
      );
    }
  }

  async function relaySigned(
    unsigned: ReturnType<NonNullable<AccountAdapter["buildSessionInstallEntry"]>>,
    op: "install" | "revoke",
    token: string,
    nonce: bigint
  ): Promise<Receipt> {
    const latest = await deps.sim.getLatestLedger();
    const signatureExpirationLedger = boundExpirationLedger(latest, latest + INSTALL_EXPIRY_LEDGER_DELTA);
    let authorizationEntryXdr: string;
    try {
      authorizationEntryXdr = await deps.account.assembleSignedEntry({
        unsigned,
        signer: deps.signer,
        signatureExpirationLedger,
        network: deps.network
      });
    } catch (cause) {
      throw new BuckspayError("SIGNATURE_REJECTED", "session install/revoke signing failed or was rejected", { cause });
    }
    try {
      return await deps.relayer.relay({
        token,
        from: deps.address,
        to: deps.address,
        value: "0",
        authorizationEntryXdr,
        nonce: nonce.toString(),
        signatureExpirationLedger,
        sessionOp: op
      });
    } catch (cause) {
      if (cause instanceof BuckspayError) throw cause;
      throw new BuckspayError("RELAYER_REJECTED", "relayer rejected the session call", { cause });
    }
  }

  return {
    async grantSession(grant: SessionGrant) {
      assertContract();
      if (grant.policies.length === 0) {
        throw new BuckspayError(
          "INVALID_CONFIG",
          "grantSession requires at least one policy; an unbounded session is refused"
        );
      }
      if (grant.expiresAt <= deps.now()) {
        throw new BuckspayError("SESSION_EXPIRED", "grant.expiresAt is in the past");
      }
      const nonce = (deps.randomNonce ?? defaultRandomNonce)();
      const unsigned = deps.account.buildSessionInstallEntry!({ from: deps.address, grant, nonce });
      const receipt = await relaySigned(unsigned, "install", routingToken(grant.policies, deps.address), nonce);
      const session: Session = {
        id: sessionId({ account: deps.address, sessionKey: grant.sessionKey.publicKey, expiresAt: grant.expiresAt }),
        account: deps.address,
        sessionKey: grant.sessionKey.publicKey,
        policies: grant.policies,
        expiresAt: grant.expiresAt
      };
      registry.set(session.id, session);
      return { session, receipt };
    },

    async revokeSession(session: Session | string) {
      assertContract();
      const resolved = typeof session === "string" ? registry.get(session) : session;
      if (!resolved) {
        throw new BuckspayError(
          "INVALID_CONFIG",
          "revokeSession: unknown session id; pass the Session object (e.g. from deserializeSession)"
        );
      }
      if (resolved.account !== deps.address) {
        throw new BuckspayError(
          "INVALID_CONFIG",
          "revokeSession: session belongs to a different account than the connected one"
        );
      }
      const nonce = (deps.randomNonce ?? defaultRandomNonce)();
      const unsigned = deps.account.buildSessionRevokeEntry!({
        from: deps.address,
        sessionKey: resolved.sessionKey,
        nonce
      });
      const receipt = await relaySigned(unsigned, "revoke", routingToken(resolved.policies, deps.address), nonce);
      registry.delete(resolved.id);
      return receipt;
    }
  };
}
