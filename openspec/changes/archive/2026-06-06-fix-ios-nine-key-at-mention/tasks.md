## 1. Spec

- [x] 1.1 Create change `fix-ios-nine-key-at-mention`
- [x] 1.2 Update `chat-message-content` for iOS nine-key `@` replacement mention triggering

## 2. RN Mention Composer

- [x] 2.1 Add text-diff based `@` trigger detection that handles insertion and replacement
- [x] 2.2 Wire the chat composer to open the mention selector from the detected final `@` position

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate fix-ios-nine-key-at-mention --type change --no-interactive`
- [x] 3.2 Run `npx tsc --noEmit`
- [x] 3.3 Confirm Metro remains available on fixed port `8081` for hot update
