## Why

The RN chat detail page only shows the lower-right shortcut when incoming messages arrive while
the user is away from the latest message. Android and iOS native clients also show the same
shortcut as a plain down-arrow button when the user manually scrolls upward to browse history.

## What Changes

- Show the lower-right scroll-to-bottom shortcut when the user scrolls away from the latest message.
- Keep the incoming-message count text when new messages arrive away from bottom.
- Use the existing UIKit down-arrow icon resource and native-aligned white floating button styling.

## Capabilities

### Modified Capabilities

- `chat-timeline-and-history`: chat detail exposes a scroll-to-bottom shortcut both for history
  browsing and for incoming new messages.

## Impact

- Affected specs: `openspec/specs/chat-timeline-and-history/spec.md`
- Affected code: `app/chat/[id].tsx`
- No SDK, API, or storage changes
