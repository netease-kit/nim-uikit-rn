## Context

`app/user/setting.tsx` currently calls `authStore.logout()` and then performs an explicit
`router.replace('/login')`. The root layout already routes unauthenticated users to `/home`, so the
manual logout redirect should match that entry behavior.

## Decision

Change the explicit post-logout route in the settings page from `/login` to `/home`. Leave session
clearing, NIM logout, and root-layout unauthenticated guards unchanged.

## Validation

- Validate the OpenSpec change.
- Run `npm run lint`.
- Run `npx tsc --noEmit`.
