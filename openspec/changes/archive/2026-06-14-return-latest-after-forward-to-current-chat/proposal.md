## Why

When the user forwards old historical messages back into the current chat, the source chat returns still anchored in history. The newly sent merged-forward message is inserted at the latest end, but the chat page preserves the historical browsing position, so the user must tap the scroll-down shortcut multiple times to reach the new message.

## What Changes

- Mark current-chat forwarding as an explicit latest-position action when the selected forward target includes the source conversation.
- After the forwarded message is inserted into that chat, align the chat timeline to the latest message.
- Preserve existing history-position behavior when forwarding to other conversations.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: Forwarding historical messages back to the current chat must return the chat timeline to the latest message.

## Impact

- Affected code: `app/chat/[id].tsx`, `app/chat/forward.tsx`, `stores/ForwardStore.ts`
- Affected behavior: chat forwarding back to the source/current conversation
- No API, dependency, route, or SDK configuration changes.
