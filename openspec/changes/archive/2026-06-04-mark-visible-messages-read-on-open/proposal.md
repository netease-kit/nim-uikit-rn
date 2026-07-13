## Why

Messages received while the reader is already viewing the chat detail page are not acknowledged as read until the reader types or sends another message. This delays the sender's read indicator and makes both P2P and team read receipt state stale.

## What Changes

- Send read receipts when the active chat receives new incoming messages.
- Make sent-message read indicators react to received read-receipt state changes.
- Keep existing sent-message receipt refresh behavior so the reader's own sent messages continue to update read indicators.
- Bridge the RN SDK's legacy online-status subscription events into the V2 subscription shape used by UIKit stores.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-timeline-and-history`: active chat unread clearing must also send read receipts for newly received messages.
- `chat-message-read-receipt`: read receipt sending and receiving must update peer/team read state without waiting for composer interaction.
- `chat-user-online-status`: RN chat and conversation online status must use SDK subscription events instead of message activity inference.

## Impact

- Affected code: `stores/MessageStore.ts`, `stores/ImStoreV2Bridge.ts`, `app/_layout.tsx`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `src/NEUIKit/rn/user-status.ts`.
- Affected flows: P2P chats and team chats when receiving messages while already on chat detail; P2P online/offline status in chat detail, conversation list, and contacts.
- No dependency or SDK API changes.
