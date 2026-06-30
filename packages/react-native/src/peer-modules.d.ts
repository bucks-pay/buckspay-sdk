// Ambient type stubs for the OPTIONAL native peers (expo-secure-store / react-native-keychain).
// We only declare the tiny surface `secure-storage.ts` touches; the real modules are provided by
// the consuming app (declared as optional peers). Keeping them out of our install tree avoids a
// heavy dependency graph (and its copyleft license surface) while still type-checking the lazy
// dynamic import().
declare module "expo-secure-store" {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}
declare module "react-native-keychain" {
  export function getGenericPassword(opts: { service: string }): Promise<false | { password: string }>;
  export function setGenericPassword(username: string, password: string, opts: { service: string }): Promise<unknown>;
  export function resetGenericPassword(opts: { service: string }): Promise<unknown>;
}
