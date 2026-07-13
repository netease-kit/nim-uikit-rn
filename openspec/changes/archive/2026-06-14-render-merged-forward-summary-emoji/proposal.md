## Why

Merged-forward chat-record cards currently render emoji-message preview tokens as plain text in the summary lines. This makes forwarded chat records visually inconsistent with normal chat text and collected message previews.

## What Changes

- Render supported UIKit emoji keys in merged-forward card summary lines as emoji icons.
- Preserve the existing sender-name prefix, wrapping, and line-clamp behavior for merged-forward summaries.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-forwarding-and-selection`: Merged-forward card summaries must render supported emoji preview tokens with UIKit emoji icons instead of plain text labels.

## Impact

- `src/NEUIKit/rn/chat-message-bubble.tsx`: merged-forward summary line rendering.
- `src/NEUIKit/rn/icon.tsx`: shared RN icon source lookup for inline emoji images.
