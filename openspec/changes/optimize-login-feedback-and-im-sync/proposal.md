# Proposal

## Why

The RN SMS login flow feels slow after tapping the login button because IM login still uses the default sync behavior and the page only shows a generic button spinner during the wait.

## What Changes

- align RN IM login with the Android login flow by using basic sync level during login
- surface clearer login-in-progress feedback on the RN login page while IM login is pending

## Impact

- affected spec: `login-im-sync-and-feedback`
- affected code: `stores/NIMStore.ts`, `app/login.tsx`, `utils/app-language.ts`
