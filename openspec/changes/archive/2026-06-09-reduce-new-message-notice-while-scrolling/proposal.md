## Why

When a user browses older chat history and a burst of new messages arrives, the RN inverted list can shift the visible history when latest messages are inserted into the data source. Hiding and later releasing those messages causes its own scroll/rendering problems, so the page should render new messages immediately while preserving the user's current visual anchor.

## What Changes

- Render newly arrived messages into the timeline immediately.
- Preserve the visible history position using the list's native visible-content anchoring instead of manual scroll-offset compensation.
- Decrease the new-message notice count as newly arrived messages become viewable during manual scrolling.
- Preserve the existing shortcut behavior: tapping the shortcut still jumps directly to the latest message and clears the notice.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-timeline-and-history`: Clarify manual-scroll behavior for new-message notices while preserving history position.

## Impact

- Affected route: `app/chat/[id].tsx`
- Affected behavior: chat detail history browsing with incoming-message notices
- No SDK API, message payload, store schema, or route changes.
