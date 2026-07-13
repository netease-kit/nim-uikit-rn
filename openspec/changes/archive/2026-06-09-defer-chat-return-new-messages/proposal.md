## Why

When the user leaves a chat screen from the latest-message position to settings, attachment pickers, camera, or message-detail viewers, new messages received in that period are currently rendered immediately after returning. This bypasses the expected new-message notice and down-arrow shortcut, so users lose the cue that new content arrived while they were away from the chat timeline.

## What Changes

- Treat messages received while the chat detail route is not visibly active as pending latest messages on return.
- Preserve the current chat return position instead of auto-scrolling or directly exposing those pending messages.
- Show the existing right-side new-message notice and down-arrow shortcut until the user taps it or returns to bottom.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-timeline-and-history`: Extend new-message notice behavior to cover messages received while the chat detail route is temporarily not visible.

## Impact

- Affected route: `app/chat/[id].tsx`
- Affected behavior: chat timeline visibility, new-message notice count, scroll-to-bottom shortcut, active read receipt timing
- No API, dependency, or storage schema changes.
