## Why

The online/offline smoke cases require one-to-one contacts to show live status in the conversation list, contacts list, and p2p chat header. The current RN screens render avatars and names but do not surface the subscribed user status, so those cases cannot be verified from the UI.

## What Changes

- Subscribe to visible p2p conversation targets and visible friends through the existing im-store-v2 subscription store.
- Render `在线` / `离线` status in p2p conversation rows, contact rows, and p2p chat header.
- Keep group/team rows unchanged.

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: p2p rows expose friend online status.
- `contacts-home`: friend rows expose friend online status.
- `chat-timeline-and-history`: p2p chat header exposes the peer online status.

## Impact

- Affected routes: `app/(tabs)/index.tsx`, `app/(tabs)/contacts.tsx`, `app/chat/[id].tsx`
- Affected shared UI: `src/NEUIKit/rn/components.tsx`
- No dependency or runtime configuration changes
