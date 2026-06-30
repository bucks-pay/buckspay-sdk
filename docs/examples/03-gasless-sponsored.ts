// Gasless modes - v1 ships exactly one: sponsored. The facilitator's sponsor account
// pays the XLM fee; the payer needs zero XLM.
import type { GasConfig } from "@buckspay/core";

export const sponsored: GasConfig = { mode: "sponsored" };

// Roadmap (NOT available in v1 - do not pass these):
//   { mode: "token", token: "USDC:GA5..." }  // pay gas in USDC via FeeForwarder
//   { mode: "self" }                          // payer pays their own fee
// The GasConfig type only admits `{ mode: "sponsored" }` today, so an unimplemented
// mode fails to type-check - the docs can't drift into an unsupported config.
