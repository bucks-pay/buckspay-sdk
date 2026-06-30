/**
 * Hermes polyfills for @stellar/stellar-sdk on React Native. Imported for SIDE EFFECTS at the
 * top of the package entry, so simply importing `@buckspay/react-native` installs the globals
 * the stellar-sdk (XDR/StrKey/base64) and the passkey challenge (getRandomValues) paths assume
 * on web. Idempotent — re-importing is a no-op.
 */
import "react-native-get-random-values"; // installs global.crypto.getRandomValues (JSI)
import { Buffer } from "@craftzdog/react-native-buffer";
import { TextEncoder, TextDecoder } from "text-encoding";

const g = globalThis as Record<string, unknown>;

if (typeof g.Buffer === "undefined") g.Buffer = Buffer;
if (typeof g.TextEncoder === "undefined") g.TextEncoder = TextEncoder;
if (typeof g.TextDecoder === "undefined") g.TextDecoder = TextDecoder;

// base64 atob/btoa — stellar-sdk's StrKey + some XDR paths reach for them; Hermes lacks them.
if (typeof g.btoa === "undefined") {
  g.btoa = (s: string): string => Buffer.from(s, "binary").toString("base64");
}
if (typeof g.atob === "undefined") {
  g.atob = (s: string): string => Buffer.from(s, "base64").toString("binary");
}
