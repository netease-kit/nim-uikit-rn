## 1. Implementation

- [x] 1.1 Add an opt-out prop for avatar profile navigation in the shared RN chat message bubble.
- [x] 1.2 Disable avatar profile navigation when rendering messages in the merged-forward detail page.
- [x] 1.3 Keep message-content open behavior unchanged in the merged-forward detail page.
- [x] 1.4 Keep normal chat timeline avatar profile navigation unchanged.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate disable-merged-forward-avatar-profile-open --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Run targeted ESLint for changed TypeScript files.
