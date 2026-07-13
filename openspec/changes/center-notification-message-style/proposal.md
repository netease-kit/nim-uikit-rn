## Why

The RN chat detail page currently renders notification messages with rounded background bubbles. The expected presentation is plain centered text without a pill-shaped container.

## What Changes

- Remove rounded background containers from chat notification messages.
- Center notification message content horizontally in the chat detail page.
- Apply the same centered plain-text treatment to related tip-style system messages.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-notification-display`: Notification messages render as centered plain text without rounded background bubbles.

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: notification and tip-style message rendering in chat detail
