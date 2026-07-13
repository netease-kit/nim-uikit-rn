## Why

The conversation list can keep showing stale P2P online/offline status when a friend logs in, logs out, or terminates the app. User status events update the status cache, but the conversation list formatting memo does not depend on that status cache changing.

## What Changes

- Add an observable user-status version that changes whenever subscribed user statuses update.
- Make the conversation list recompute formatted rows when the user-status version changes.
- Preserve existing account subscription scope and row rendering behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `conversation-list`: P2P online/offline status refresh behavior.

## Impact

- Affected files: `src/NEUIKit/rn/user-status.ts`, `app/(tabs)/index.tsx`.
- Affected flow: conversation list P2P online/offline indicator refresh.
- No SDK, dependency, or navigation API changes.
