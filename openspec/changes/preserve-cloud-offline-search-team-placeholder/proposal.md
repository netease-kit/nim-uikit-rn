## Why

Offline search can open a joined team that is not currently present in the cloud conversation list. RN already creates a local placeholder for the local conversation path, but cloud conversation mode ignores that placeholder, causing the chat header to fall back to the team id and later operations to fail with `conversation not exist`.

## What Changes

- Preserve searched team metadata as a cloud-mode fallback when the cloud conversation row does not exist yet.
- Ensure cloud-mode chat entry and message sending create the cloud conversation when possible, matching native Android/iOS behavior.
- Keep fallback placeholder rows out of the pinned section unless a real cloud conversation reports `stickTop`.
- Keep explicit deletion and invalid-team pruning authoritative so deleted or unavailable conversations do not reappear from local placeholders.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `conversation-search-and-picker`: Offline team search navigation must work the same in cloud conversation mode.
- `conversation-list-behavior`: Cloud conversation lists must preserve valid local fallback rows until the real cloud conversation is available.

## Impact

- Affected runtime code: `stores/ImStoreV2Bridge.ts`, `stores/MessageStore.ts`, `app/chat/[id].tsx`.
- Affected specs: `conversation-search-and-picker`, `conversation-list-behavior`.
- No external dependency or public API changes.
