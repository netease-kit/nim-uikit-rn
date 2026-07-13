## 1. Implementation

- [x] 1.1 Add pinned AI user data preparation for the RN conversation list.
- [x] 1.2 Render a dedicated AI header section above the normal conversation rows.
- [x] 1.3 Reuse existing AI conversation opening behavior from the conversation list header.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `OPENSPEC_TELEMETRY=0 openspec validate pin-ai-conversations-to-top --type change --no-interactive`.
