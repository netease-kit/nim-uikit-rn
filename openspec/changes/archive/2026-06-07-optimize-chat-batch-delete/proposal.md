## Why

Deleting many selected chat messages currently waits on each message deletion one by one, so deleting 50 messages can take a long time before the UI exits multi-select mode. Android and iOS native implementations use batch deletion for the same flow, and RN should follow that behavior.

## What Changes

- Change RN chat multi-select deletion to use the SDK batch delete path instead of serially awaiting each message.
- Keep the native-aligned 50-message limit and allow exactly 50 selected messages; only selections above 50 are rejected.
- Batch local message removal and deletion-notification handling so preview refresh and timeline updates happen once per affected conversation instead of once per message.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: multi-select message deletion performance and limit behavior.

## Impact

- `app/chat/[id].tsx`: multi-select delete action dispatch.
- `app/_layout.tsx`: SDK deletion notification handling.
- `stores/MessageStore.ts`: batch remote deletion and batch local message removal.
