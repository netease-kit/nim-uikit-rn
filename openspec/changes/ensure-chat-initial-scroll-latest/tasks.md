## 1. Spec

- [x] 1.1 Create change `ensure-chat-initial-scroll-latest`
- [x] 1.2 Add `chat-initial-scroll-latest` spec for initial latest-message positioning

## 2. Implementation

- [x] 2.1 Update `app/chat/[id].tsx` to defer the first bottom scroll until the message list content is laid out
- [x] 2.2 Preserve manual scroll position after the first successful bottom positioning

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate ensure-chat-initial-scroll-latest --type change --no-interactive`
- [x] 3.2 Run `npm run lint`
- [x] 3.3 Run `npx tsc --noEmit`
