## Why

Recalled-message notices and the `重新编辑` action currently depend on in-memory recall maps. When recall happens while the user is offline, or after the app process is killed and restarted, those maps are empty and the chat timeline no longer shows recall notices or re-edit state.

## What Changes

- Rebuild recall notice state from persisted message extension data when history messages are loaded or merged into the RN store.
- Keep recalled-message notices visible after offline sync and process restart.
- Keep `重新编辑` visibility derived from the persisted revoke time so the two-minute edit window remains correct after re-entry.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `chat-message-actions-and-receipts`: Recall notice persistence and re-edit recovery across offline sync and process restart.

## Impact

- Affects `stores/MessageStore.ts` recall-state hydration.
- No SDK API, dependency, route, or database schema changes.
