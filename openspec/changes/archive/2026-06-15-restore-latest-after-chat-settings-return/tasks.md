## 1. Implementation

- [x] 1.1 Inspect chat detail temporary-leave and return state handling
- [x] 1.2 Preserve the new-message notice while allowing manual scroll to reveal deferred latest messages after returning from chat settings

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`
- [x] 2.2 Run `npm run lint`
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate restore-latest-after-chat-settings-return --type change --no-interactive`
