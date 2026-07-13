## Why

Pinned-message background rendering currently competes with the read-receipt indicator for messages sent by the current user. This can hide the receipt in normal chat and push it far away from the bubble in multi-select mode.

## What Changes

- Keep current-user read and unread indicators visible above pinned-message backgrounds.
- Align current-user read and unread indicators next to the message bubble in both normal and multi-select chat layouts.
- Preserve existing receipt visibility rules for sending, failed, P2P, and team messages.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-message-actions-and-receipts`: current-user read receipts must remain visible and adjacent to pinned message bubbles.

## Impact

- Affects RN chat message bubble layout in `src/NEUIKit/rn/chat-message-bubble.tsx`.
- Affects pinned current-user messages and multi-select current-user pinned messages in chat detail.
