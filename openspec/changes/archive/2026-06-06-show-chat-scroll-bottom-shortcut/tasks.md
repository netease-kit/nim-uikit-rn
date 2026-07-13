## 1. Spec

- [x] 1.1 Create change `show-chat-scroll-bottom-shortcut`
- [x] 1.2 Update `chat-timeline-and-history` for the history-browsing scroll shortcut

## 2. RN Chat Detail

- [x] 2.1 Show the shortcut when the user scrolls away from the latest message
- [x] 2.2 Preserve count-based text for newly arrived messages
- [x] 2.3 Align the floating shortcut icon and shape with native clients

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate show-chat-scroll-bottom-shortcut --type change --no-interactive`
- [x] 3.2 Run `npx tsc --noEmit`
- [x] 3.3 Confirm Metro remains available on fixed port `8081`
