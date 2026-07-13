## Why

Chat multi-select mode currently prevents failed-message resend by hiding the failed-message indicator entirely. This removes the expected failed-state visual cue even though multi-select only needs to disable retry behavior.

## What Changes

- Keep the failed-message exclamation indicator visible in chat multi-select mode.
- Disable failed-message retry from that indicator while multi-select mode is active.
- Preserve normal failed-message retry behavior outside multi-select mode.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: Multi-select mode must show failed-message state while keeping resend unavailable.

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: failed outgoing message rows in chat multi-select mode
- No API, dependency, or backend impact.
