## Why

Chat mention test cases expect team chats to behave like the Android IMKit: typing `@` or long-pressing another member avatar opens/selects a mention, sent text carries mention metadata, received mention text is highlighted, and conversation rows mark messages that mention the current user. The RN demo currently renders mention metadata when it already exists, but it does not create, maintain, or clear that metadata from the composer and local conversation path.

## What Changes

- Add team-chat mention composition from `@` input and long-pressing another member avatar.
- Preserve Android-compatible `serverExtension.yxAitMsg` metadata when sending, replying, resending, and forwarding mention text.
- Keep mention blocks valid while editing, deleting, and re-editing messages.
- Ensure incoming mention messages mark conversation previews with `[有人@我]` until the conversation is opened or cleared.
- Render sent and received mentions with the existing RN UIKit rich text styling.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-message-content`: Adds team mention composition, metadata, deletion, rendering, and re-edit behavior.
- `conversation-list-behavior`: Clarifies current-user mention detection and clearing in conversation previews.
- `chat-forwarding-and-selection`: Clarifies forwarding behavior for messages that contain mention metadata.

## Impact

- Affected code: `app/chat/[id].tsx`, `stores/MessageStore.ts`, `stores/ConversationStore.ts`, `utils/`, `src/NEUIKit/rn/`.
- Runtime behavior: text send parameters may include force-push data derived from `yxAitMsg`.
- No dependency or route-structure changes are required.
