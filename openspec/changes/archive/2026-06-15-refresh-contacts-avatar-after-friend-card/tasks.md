## 1. Implementation

- [x] 1.1 Inspect the contacts friend row avatar source and confirm whether an explicit friend-profile avatar overrides shared UIKit avatar resolution.
- [x] 1.2 Update the contacts friend row avatar source so returning from friend card can reflect the latest avatar without pull-to-refresh.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `npm run lint`.
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate refresh-contacts-avatar-after-friend-card --type change --no-interactive`.
