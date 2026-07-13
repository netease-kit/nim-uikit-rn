## Why

RN Android renders `@xxx hi` with `hi` on a separate line because mention and trailing text are split into sibling flex text nodes. Mention text should behave as one inline text flow so short trailing Latin words stay on the same line when there is room.

## What Changes

- Render non-emoji rich text segments as inline nested text instead of sibling flex items.
- Keep mention and link styling inside the same text flow.
- Preserve the existing emoji wrapping behavior for messages that contain rendered emoji icons.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-message-content`: tighten mention text rendering requirements on Android.

## Impact

- Affected code: `src/NEUIKit/rn/chat.tsx`
- Affected behavior: text message rendering for mention/link/plain text content in chat bubbles
- No message metadata, sending, or parsing format changes.
