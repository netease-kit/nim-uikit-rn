## 1. Implementation

- [x] 1.1 Inspect the shared toast type-to-style mapping for RN and web.
- [x] 1.2 Align the success toast background with the default informational toast background without changing existing success API calls.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `npm run lint`.
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate remove-green-success-toast --type change --no-interactive`.
