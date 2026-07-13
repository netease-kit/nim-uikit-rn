## 1. Implementation

- [x] Inspect contacts friend directory ordering and forward picker friend ordering.
- [x] Align the forward picker friends tab with the contacts friend directory order.
- [x] Keep existing blacklist and AI-user exclusion behavior.

## 2. Validation

- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate align-forward-friend-order-with-contacts --type change --no-interactive`.
- [x] Run `npx tsc --noEmit`.
- [x] Check Expo startup status on port 8081 or start Metro if needed.
