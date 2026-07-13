## Why

When cloud conversations are enabled, the forward target picker still mixes or falls back to local conversations for the recent chats list. This makes the picker differ from the active conversation list and can show stale local conversations.

## What Changes

- Use cloud conversation display data for the forward picker's recent chats when cloud conversations are enabled.
- Avoid merging local conversations into the forward recent chats list in cloud conversation mode.
- Avoid creating a local conversation as a side effect of forwarding when cloud conversations are active.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-forwarding`: Forward target picker recent chat source behavior in cloud conversation mode.

## Impact

- Affected route: `app/chat/forward.tsx`.
- Affected flow: forwarding messages when cloud conversations are enabled.
- Local-conversation mode behavior remains unchanged.
