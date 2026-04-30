## 1. Spec

- [ ] 1.1 Create change `align-chat-read-receipt-with-uikit`
- [ ] 1.2 Add `chat-message-read-receipt` spec for chat-detail message receipt presentation

## 2. Implementation

- [ ] 2.1 Add an RN UIKit message read indicator component that matches the H5 icon/progress presentation
- [ ] 2.2 Update `app/chat/[id].tsx` to replace text read receipts with the RN UIKit indicator for P2P and team messages
- [ ] 2.3 Keep team-message read-detail navigation on non-fully-read receipts

## 3. Validation

- [ ] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-chat-read-receipt-with-uikit --type change --no-interactive`
- [ ] 3.2 Run `npm run lint`
- [ ] 3.3 Run `npx tsc --noEmit`
