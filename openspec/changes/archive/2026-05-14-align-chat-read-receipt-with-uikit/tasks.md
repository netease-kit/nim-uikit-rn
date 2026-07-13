## 1. Spec

- [x] 1.1 Create change `align-chat-read-receipt-with-uikit`
- [x] 1.2 Add `chat-message-read-receipt` spec for chat-detail message receipt presentation

## 2. Implementation

- [x] 2.1 Add an RN UIKit message read indicator component that matches the H5 icon/progress presentation
- [x] 2.2 Update `app/chat/[id].tsx` to replace text read receipts with the RN UIKit indicator for P2P and team messages
- [x] 2.3 Keep team-message read-detail navigation on non-fully-read receipts
- [x] 2.4 Keep team-message read-detail navigation on fully-read receipts
- [x] 2.5 Register the read-detail page in the root navigation stack
- [x] 2.6 Avoid root push-notification param collision when opening read-detail
- [x] 2.7 Reserve top safe-area space in the read-detail header

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-chat-read-receipt-with-uikit --type change --no-interactive`
- [x] 3.2 Run `npm run lint` (blocked by pre-existing unrelated prettier/import-sort issues outside this change)
- [x] 3.3 Run `npx tsc --noEmit`
