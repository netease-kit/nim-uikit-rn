## Why

The chat detail page still treats the emoji button as a placeholder, so users cannot insert emoji
from the composer the way the H5 UIKit flow already supports. On mobile devices, the keyboard can
also cover the composer and send button, which breaks basic message entry.

## What Changes

- Add a real emoji input panel to the chat detail composer, aligned with the H5 UIKit emoji-input
  flow.
- Support emoji token insertion, whole-token delete behavior, and composer-level send from the
  emoji panel.
- Keep the chat composer visible above the on-screen keyboard on supported mobile targets.
- Update chat text rendering so supported emoji tokens display consistently after send.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-message-content`: the composer now supports emoji-panel input and keeps the composer visible
  while the keyboard is open

## Impact

- Affected specs: `openspec/specs/chat-message-content/spec.md`
- Affected code: `app/chat/[id].tsx`, `src/NEUIKit/rn/chat.tsx`, `src/NEUIKit/rn/icon.tsx`,
  `src/NEUIKit/common/utils/i18n.ts`
- No API or storage schema changes
