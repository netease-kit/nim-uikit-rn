## Why

The RN conversation list does not currently surface AI users at the top like the Android and Vue Web implementations. This creates a visible behavior mismatch across platforms and makes pinned AI entry points harder to discover in RN.

## What Changes

- Add a dedicated AI user header strip at the top of the RN conversation list.
- Show only the currently pinned AI users, matching the Android implementation semantics.
- Keep the normal conversation ordering unchanged below the AI header strip.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `conversation-list`: The RN conversation list shows pinned AI users in a dedicated top section before normal conversations.

## Impact

- Affected code: `app/(tabs)/index.tsx`
- Affected behavior: conversation-list header composition and AI user entry visibility
