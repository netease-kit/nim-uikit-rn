## Why

In chat multi-select mode, one-by-one forwarding silently removes selected unsupported messages such as voice messages, failed messages, or call-record messages. Users receive no feedback and cannot tell why the selected message was unchecked.

## What Changes

- Show the existing unsupported-forwarding tip when one-by-one forwarding removes unsupported selected messages.
- Keep removing unsupported messages from the selection and stay in multi-select mode so the user can review the remaining selected messages.
- Preserve existing merged-forward behavior and forwarding limits.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: Clarify serial forwarding behavior when selected messages include unsupported message bodies.

## Impact

- Affected route: `app/chat/[id].tsx`
- Affected behavior: chat multi-select one-by-one forwarding feedback and selection cleanup
- No message payload, store schema, or SDK API changes.
