/**
 * Secure-storage port for the SCOPED session key at rest.
 *
 * Only the deliberately-minted session blob (the serialized `Session` from @buckspay/core) is
 * ever written here - it is policy-scoped and expiring, never the root account key. The root
 * passkey private key never leaves the device secure enclave and is never passed to this port.
 * Peer impls use the OS keystore (expo-secure-store / Keychain / Keystore), never plain
 * AsyncStorage. The peers are loaded with a memoized dynamic import so an app only needs the one
 * it chooses, and so the binding stays ESM/Hermes-correct (no CommonJS `require`).
 */
import { BuckspayError } from "@buckspay/core";
// Type-only imports of the OPTIONAL peers - erased at build, so they create no runtime dependency
// for an app that uses the other store. The values are loaded lazily via dynamic import().
import type * as ExpoSecureStore from "expo-secure-store";
import type * as RNKeychain from "react-native-keychain";

export interface SecureStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

function assertKey(key: string): void {
  if (!key || key.trim() === "") {
    throw new BuckspayError("INVALID_CONFIG", "SecureStore: key must be a non-empty string");
  }
}

/** Run `fn` only for a valid key; an empty key fails closed with a rejected promise (never a no-op). */
function withKey<T>(key: string, fn: () => T): Promise<T> {
  if (!key || key.trim() === "") {
    return Promise.reject(new BuckspayError("INVALID_CONFIG", "SecureStore: key must be a non-empty string"));
  }
  return Promise.resolve(fn());
}

/** In-memory store - tests and connect-only flows. NOT durable; never the production default. */
export function memorySecureStore(): SecureStore {
  const mem = new Map<string, string>();
  return {
    get: (key) => withKey(key, () => mem.get(key) ?? null),
    set: (key, value) => withKey(key, () => void mem.set(key, value)),
    delete: (key) => withKey(key, () => void mem.delete(key))
  };
}

/** Expo apps: backed by `expo-secure-store` (Keychain on iOS, Keystore on Android). */
// Variable specifiers (+ @vite-ignore) keep the bundler from eagerly resolving the OPTIONAL peers
// at build time - they are only required at runtime by an app that uses that store.
const EXPO_SECURE_STORE = "expo-secure-store";
const RN_KEYCHAIN = "react-native-keychain";

export function expoSecureStore(): SecureStore {
  let modP: Promise<typeof ExpoSecureStore> | null = null;
  const load = () => (modP ??= import(/* @vite-ignore */ EXPO_SECURE_STORE) as Promise<typeof ExpoSecureStore>);
  return {
    async get(key) {
      assertKey(key);
      return (await load()).getItemAsync(key);
    },
    async set(key, value) {
      assertKey(key);
      await (await load()).setItemAsync(key, value);
    },
    async delete(key) {
      assertKey(key);
      await (await load()).deleteItemAsync(key);
    }
  };
}

/** Bare RN apps: backed by `react-native-keychain` (one generic-password slot per `service`). */
export function keychainSecureStore(opts: { service: string }): SecureStore {
  if (!opts.service || opts.service.trim() === "") {
    throw new BuckspayError("INVALID_CONFIG", "keychainSecureStore: service is required");
  }
  let modP: Promise<typeof RNKeychain> | null = null;
  const load = () => (modP ??= import(/* @vite-ignore */ RN_KEYCHAIN) as Promise<typeof RNKeychain>);
  // react-native-keychain keys by `service`; namespace the logical key inside it.
  const svc = (key: string) => `${opts.service}:${key}`;
  return {
    async get(key) {
      assertKey(key);
      const got = await (await load()).getGenericPassword({ service: svc(key) });
      return got === false ? null : got.password;
    },
    async set(key, value) {
      assertKey(key);
      await (await load()).setGenericPassword("buckspay", value, { service: svc(key) });
    },
    async delete(key) {
      assertKey(key);
      await (await load()).resetGenericPassword({ service: svc(key) });
    }
  };
}
