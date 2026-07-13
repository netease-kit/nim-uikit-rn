## 1. Implementation

- [x] 1.1 Add a visible sending indicator for outgoing text messages that remain in the sending state
- [x] 1.2 Ensure reply text messages use the same sending-state feedback before real success or failure is known

## 2. Validation

- [x] 2.1 Run `npm run lint`
- [x] 2.2 Run `npx tsc --noEmit`
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate show-reply-text-send-loading-state --type change --no-interactive`
