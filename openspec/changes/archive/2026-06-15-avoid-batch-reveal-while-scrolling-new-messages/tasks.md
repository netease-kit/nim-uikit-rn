## 1. Implementation

- [x] 1.1 Inspect deferred new-message reveal behavior for manual scrolling and shortcut jumps
- [x] 1.2 Remove forced batch jump-to-bottom from the manual scroll reveal path while preserving shortcut behavior

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`
- [x] 2.2 Run `npm run lint`
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate avoid-batch-reveal-while-scrolling-new-messages --type change --no-interactive`
