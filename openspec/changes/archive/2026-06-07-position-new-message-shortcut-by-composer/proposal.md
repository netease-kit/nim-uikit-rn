## Why

The chat new-message/scroll-to-bottom shortcut and lightweight chat-page toast were positioned outside the composer flow. Those page-level placements can fall out of sync with the actual composer placement and may cause the shortcut or toast to be covered by the input module. Shared native toast feedback also needs consistent custom overlay presentation across RN screens so it is not hidden by the keyboard.

## What Changes

- Render the new-message/scroll-to-bottom shortcut inside the chat composer dock.
- Position the shortcut absolutely relative to the composer dock instead of the page container.
- Render lightweight chat-page toast inside the same composer dock and position it relative to the input module.
- Route shared native toast feedback on all platforms through the custom root toast host.
- Position shared toast feedback in the lower-middle viewport, above the keyboard when it is visible, with high overlay priority.
- Keep the shortcut visually above the input module across text, voice, emoji, and panel states.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-timeline-and-history`: new-message shortcut and chat-page toast placement is anchored to the composer module.
- `native-toast-feedback`: shared toast feedback uses a custom keyboard-aware root overlay across platforms.

## Impact

- `app/chat/[id].tsx`: composer-relative shortcut and local toast overlay positioning.
- `src/NEUIKit/common/utils/native-toast-host.tsx`: keyboard-aware shared toast host positioning.
- `src/NEUIKit/common/utils/toast.native.ts`: route Android toast feedback through the shared host.
