## 1. Implementation

- [x] 1.1 Remove the location send button from the chat more panel.
- [x] 1.2 Remove now-unused chat-page location send handler/imports.
- [x] 1.3 Preserve location message render/open/detail/resend paths.
- [x] 1.4 Update composer and location-message spec deltas.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate remove-location-send-entry --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Run targeted ESLint for changed TypeScript files.
