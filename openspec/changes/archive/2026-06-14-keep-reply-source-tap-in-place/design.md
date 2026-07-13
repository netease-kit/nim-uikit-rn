## Context

The chat detail route passes a handler into `UIKitChatMessageBubble` for tapping the reply preview. The previous handler called `scrollToMessage`, causing a timeline jump to the source message when the source was still available.

## Goals / Non-Goals

**Goals:**

- Make tapping a reply preview's quoted source area open a dedicated source-message detail page.
- Render the quoted source message with the same `UIKitChatMessageBubble` component and styling used in chat detail.
- Keep source-message detail page message-area padding aligned with chat detail.
- Render the quoted source message on the left side regardless of whether the current user sent it.
- Show the current user's source-message sender name with priority group nickname, personal nickname, then account ID.
- Keep the chat timeline from jumping or scrolling to the quoted source message position.
- Preserve all existing behavior for tapping the message bubble content itself.

**Non-Goals:**

- Change reply preview rendering, hydration, or unavailable-source fallback copy.
- Change collection, pinned, history, or merged-forward secondary message surfaces unless explicitly requested.

## Decisions

- Bind the chat detail reply-preview tap handler to route into `app/chat/source-message.tsx`.
- Pass `conversationId` and the source `messageId` so the page can resolve the already hydrated source message from `messageStore`.
- Render a single `UIKitChatMessageBubble` on the new page, preserving chat-detail bubble styling and reply-preview styling when the source message itself is also a reply.
- Use the same message-list content padding as chat detail for the source-message detail page.
- Force source-message detail rendering to use the left-side bubble layout for every source message.
- When the source message sender is the current user, pass a sender name override resolved from group nickname, personal nickname, then account ID.
- Keep media, location, merged-forward, file, and audio bubble actions on the source-message detail page aligned with chat detail behavior.
- Leave `UIKitChatMessageBubble` capable of accepting a reply tap handler so secondary surfaces and future callers can continue to choose their own behavior.

## Risks / Trade-offs

- Users can no longer use the reply preview as a quick source-message locator in chat detail. The tap now opens source-message content on a detail page instead.
