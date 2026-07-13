## 1. Implementation

- [x] 1.1 Replace locale-dependent conversation list timestamp formatting with a fixed formatter.
- [x] 1.2 Cover today, current-year, and cross-year display rules.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `OPENSPEC_TELEMETRY=0 openspec validate unify-conversation-list-time-format --type change --no-interactive`.
