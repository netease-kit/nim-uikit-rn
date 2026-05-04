## 1. Spec

- [x] 1.1 Create change `align-chat-avatar-with-conversation-list`
- [x] 1.2 Add `chat-message-avatar-alignment` spec for chat-detail avatar alignment

## 2. Implementation

- [x] 2.1 Update `app/chat/[id].tsx` avatar sizing and wrapper spacing to match conversation-list UIKit usage
- [x] 2.2 Remove conflicting chat-detail avatar wrapper styling that causes visible offset

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-chat-avatar-with-conversation-list --type change --no-interactive`
- [x] 3.2 Run `npm run lint`
- [x] 3.3 Run `npx tsc --noEmit`
