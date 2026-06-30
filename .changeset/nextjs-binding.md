---
"@buckspay/nextjs": patch
---

**Next.js binding.** `@buckspay/nextjs` ships two App Router route-handler factories: `createRelayRoute`
(the packaged same-origin BFF that forwards a signed intent to the facilitator with the apiKey
server-side and returns the `Receipt`) and `createSignerProxyRoute` (forwards social/email bodies to the
facilitator `/auth/*`, injecting the apiKey from server env). Both zod-validate request bodies and keep
every secret out of the client bundle — the module is server-only and the apiKey never appears in any
response. This completes the social + email onboarding loop end-to-end.
