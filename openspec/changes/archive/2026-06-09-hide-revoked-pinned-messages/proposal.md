## Why

Pinned messages that have been recalled can still appear in the pinned-message list as recalled placeholder rows. The chat detail correctly removes the visible pin state, but the pinned list can restore pin records from SDK pin-list sync and resolve them to recalled messages.

## What Changes

- Hide recalled messages from the pinned-message list.
- Prevent recalled message references from being treated as currently pinned.
- Keep existing chat timeline recall behavior unchanged, including showing the recalled-message notice in the original message position.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-message-actions-and-receipts`: Clarify pinned-message list behavior when a pinned message is recalled.

## Impact

- Affected store: `stores/MessageStore.ts`
- Affected page: `app/chat/pins.tsx` via pinned-message store data
- No SDK API, message payload, route, or visual component changes.
