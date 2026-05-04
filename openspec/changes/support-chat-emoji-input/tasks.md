## 1. Spec

- [x] 1.1 Create change `support-chat-emoji-input`
- [x] 1.2 Update `chat-message-content` for emoji-panel input and keyboard-safe composer behavior

## 2. RN Composer And Rendering

- [x] 2.1 Add RN-side emoji picker and emoji-rich text helpers in `src/NEUIKit/rn`
- [x] 2.2 Update `app/chat/[id].tsx` to open, close, insert, delete, and send emoji tokens from the composer
- [x] 2.3 Keep the chat composer visible above the mobile keyboard while typing and while auxiliary panels toggle

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate support-chat-emoji-input --type change --no-interactive`
- [x] 3.2 Run `npm run lint`
- [x] 3.3 Run `npx tsc --noEmit`
- [x] 3.4 Run `npm run start -- --non-interactive` and confirm the affected Expo target can boot or document the local blocker
