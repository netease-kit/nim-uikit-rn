## Why

When the user scrolls through older chat history, incoming messages in the current conversation can still trigger the chat list's auto-scroll path. This pulls the user away from the historical messages they are reading instead of using the existing new-message notice affordance.

## What Changes

- Track when the chat timeline is explicitly browsing older history.
- Suppress automatic scrolling for incoming messages and same-account messages synced from another endpoint while that history-browsing state is active.
- Defer rendering newly arrived latest messages while the user is browsing older history so the inverted list does not shift or flicker.
- Keep showing the right-side new-message notice with the accumulated count, and clear the browsing state only when the user returns to the latest message.
- Move the iOS new-message notice slightly upward to match the expected chat safe-area positioning.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-timeline-and-history`: incoming messages while browsing older history preserve the current scroll position and show the new-message notice.

## Impact

- `app/chat/[id].tsx`: chat timeline scroll-state handling and incoming-message auto-scroll decision.
