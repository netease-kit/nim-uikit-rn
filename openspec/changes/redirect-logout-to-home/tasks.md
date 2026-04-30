## 1. Spec

- [x] 1.1 Create change `redirect-logout-to-home`
- [x] 1.2 Update `auth-session-lifecycle` to require routing to `home` after manual logout

## 2. Implementation

- [x] 2.1 Update the settings logout flow to replace to `/home`
- [x] 2.2 Keep existing local-session clearing and async NIM logout behavior unchanged

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate redirect-logout-to-home --type change --no-interactive`
- [x] 3.2 Run `npm run lint`
- [x] 3.3 Run `npx tsc --noEmit`
