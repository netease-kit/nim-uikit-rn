## Why

The forward confirmation modal keeps a fixed centered layout when the comment input focuses, so the keyboard can cover the input field. This affects single-message forwarding, merged forwarding, and one-by-one forwarding because they share the same confirmation modal.

## What Changes

- Add keyboard avoidance to the shared forward confirmation modal.
- Keep the comment input and action buttons visible when the keyboard is open.
- Preserve the existing confirmation content, target preview, and send/cancel behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-forwarding`: Forward confirmation modal keyboard avoidance behavior.

## Impact

- Affected route: `app/chat/forward.tsx`.
- Affected flow: single-message forwarding, merged forwarding, and one-by-one forwarding confirmation.
- No dependency, SDK, or navigation API changes.
