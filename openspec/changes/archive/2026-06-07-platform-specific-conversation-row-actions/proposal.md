## Why

iOS conversation rows currently expose both swipe and long-press actions, and the custom swipe gesture often conflicts with normal list scrolling so the extra actions are unreliable. The native behavior expectation is platform-specific: Android keeps swipe actions, while iOS keeps long-press actions.

## What Changes

- Make conversation row action entry platform-specific.
- Android conversation rows continue to use left-swipe actions for pin and delete.
- iOS conversation rows stop registering swipe actions and use long-press actions only.
- Row tap behavior remains unchanged on both platforms.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `conversation-list-behavior`: conversation row action entry differs by platform.

## Impact

- Affects `app/(tabs)/index.tsx` conversation list rendering and row interaction wiring.
- No dependency, API, or native configuration changes.
