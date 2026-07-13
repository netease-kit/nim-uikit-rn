## Why

On a physical iPhone, the iOS numeric nine-key keyboard can enter `@` by first inserting `.`
from the `.,;` key and then replacing that character with `@`. The RN chat composer currently
opens the mention selector only when the text length increases, so this replacement input path
does not trigger the team-member selector even though the final composer text contains `@`.

The iOS native UIKit handles the single-character `@` from the text-input delegate replacement
text and opens the selector from that input action, so RN should not depend on length-only
insertion detection.

## What Changes

- Detect newly entered `@` by comparing the previous and next composer text, including same-length
  replacements such as `.` -> `@`.
- Keep existing team-only mention behavior and continue to insert the selected mention at the
  detected `@` position.
- Preserve normal deletion, reply-prefix, emoji, and existing mention metadata behavior.

## Capabilities

### Modified Capabilities

- `chat-message-content`: team mention composition now supports iOS nine-key replacement input for
  the `@` trigger.

## Impact

- Affected specs: `openspec/specs/chat-message-content/spec.md`
- Affected code: `app/chat/[id].tsx`, `utils/mention.ts`
- No API, storage schema, or native project changes
