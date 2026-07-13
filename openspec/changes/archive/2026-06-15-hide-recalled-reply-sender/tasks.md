## 1. Implementation

- [ ] 1.1 Inspect the RN reply preview rendering path for sender title and fallback copy.
- [ ] 1.2 Hide the reply preview sender title when the source message has been recalled, deleted, or is otherwise unavailable.

## 2. Validation

- [ ] 2.1 Run `npx tsc --noEmit`.
- [ ] 2.2 Run `npm run lint`.
- [ ] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate hide-recalled-reply-sender --type change --no-interactive`.
