## Why

Outgoing messages in AI P2P chats currently reuse the ordinary P2P read-receipt path. AI accounts do not provide the same peer read-receipt signal as normal users, so sent messages remain stuck in the unread indicator state even after successful send.

## What Changes

- Treat successful outgoing messages in AI P2P chats as read for chat-detail receipt presentation.
- Keep ordinary P2P receipt behavior unchanged for non-AI users.
- Limit the change to chat-detail read-indicator rendering.

## Capabilities

### Modified Capabilities

- `chat-message-read-receipt`: AI P2P chats show sent-message receipts as read after successful send.

## Impact

- Affected code: `stores/MessageStore.ts`
- Affected behavior: AI single-chat sent-message read-indicator presentation
