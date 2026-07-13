## Why

The RN forwarding confirmation modal does not match the native and Figma target preview rules: multi-target forwarding only shows about four avatars on narrow screens, target names wrap, and single-target forwarding does not show the name after the avatar.

## What Changes

- Render a single forwarding target as avatar plus one-line target name in the confirmation modal.
- Render multiple forwarding targets as avatars only, capped at six visible avatars with no seventh overflow item.
- Keep the forwarded conversation-record preview on one line, truncating only the source title while preserving the fixed suffix text.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `chat-forwarding-and-selection`: Forwarding confirmation modal target preview and conversation-record text layout.

## Impact

- Affects `app/chat/forward.tsx` confirmation modal rendering and styles.
- No SDK, API, storage, or dependency changes.
