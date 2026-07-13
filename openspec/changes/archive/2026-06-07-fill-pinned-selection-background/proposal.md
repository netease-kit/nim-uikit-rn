## Why

Marked messages in chat multi-select mode currently render the marked background only behind the message content area, leaving the checkbox lane outside the highlighted row. The visual should read as one full-width marked row while keeping the checkbox tappable and unobscured.

## What Changes

- Extend the marked-message background across the full multi-select message row.
- Keep the selection checkbox above the marked-message background layer.
- Preserve existing non-selection marked-message background behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: tighten marked-message rendering requirements in multi-select mode.

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: chat detail multi-select rendering for marked or pinned message rows
- No API, data model, or message action changes.
