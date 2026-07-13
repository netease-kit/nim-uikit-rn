## 1. Implementation

- [x] 1.1 Gate the chat "no more" system row on the real exhausted-history state
- [x] 1.2 Prevent the "no more" row from rendering while older-history loading is still in progress

## 2. Validation

- [x] 2.1 Run `npm run lint`
- [x] 2.2 Run `npx tsc --noEmit`
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate hide-chat-no-more-until-history-exhausted --type change --no-interactive`
