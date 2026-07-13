## Why

Clearing conversation unread state currently depends on the SDK source updating immediately and durably. After a disconnect/reconnect and cold restart, stale synced conversation unread counts can be merged back into the RN list, causing conversations the user already cleared to show unread badges again.

## What Changes

- Persist an account-scoped clear-unread watermark for each conversation when the user clears unread state from the conversation list or chat detail.
- Suppress SDK unread counts that belong to messages at or before the persisted clear watermark during conversation refresh, SDK change events, and app restart.
- Keep mention and `aitMsgs` indicators cleared when unread is suppressed.
- Preserve normal unread behavior for messages newer than the clear watermark.

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: cleared conversation unread state must remain cleared across reconnect and process restart until newer unread messages arrive.

## Impact

- Affects conversation state merging in `stores/ConversationStore.ts`.
- Affects im-store-v2 conversation display and unread totals through `stores/ImStoreV2Bridge.ts`.
- Affects conversation-list clear-unread routing in `app/(tabs)/index.tsx`.
- Adds a local persisted storage key in `constants/NIMConfig.ts`.
