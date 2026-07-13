## Why

When the user multi-select deletes the latest messages in a chat, the inverted message list can preserve an older visible anchor after the removed rows disappear. The chat then lands on historical messages instead of the remaining latest message, making the delete result feel like an unintended jump.

## What Changes

- Keep the chat detail timeline positioned at the remaining latest message after a batch delete that includes the current latest message.
- Preserve existing history-browsing behavior when batch deletion does not remove the latest end of the timeline.
- Keep the existing batch delete limit, network requirement, and message deletion APIs unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: Multi-select batch deletion must restore the correct latest-message position when deleting the newest selected messages.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: chat multi-select batch deletion and post-delete scroll positioning
- No API, dependency, route, or SDK configuration changes.
