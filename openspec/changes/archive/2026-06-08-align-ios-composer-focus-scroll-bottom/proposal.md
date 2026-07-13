## Why

When an iOS user is browsing older messages and focuses the chat composer, the keyboard opens but the message list does not return to the latest messages. Android already triggers bottom alignment on keyboard show, so iOS should match that behavior.

## What Changes

- Add iOS keyboard-show handling for the existing composer focus bottom-alignment flow.
- Keep Android keyboard inset and alignment behavior unchanged.
- Preserve the existing protection against auto-scrolling for newly received messages while browsing history; explicit composer focus still returns to the latest messages.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-detail`: Chat composer focus behavior while browsing historical messages.

## Impact

- Affected route: `app/chat/[id].tsx`.
- Affected platform: RN iOS chat detail.
- Affected flow: focusing the text input while viewing historical messages.
