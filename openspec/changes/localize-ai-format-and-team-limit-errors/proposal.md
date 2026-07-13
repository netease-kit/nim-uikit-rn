## Why

Some SDK or send-path errors are currently surfaced as English text in Chinese app flows. This breaks the expected localized feedback for AI P2P unsupported attachments and group join failures when the group member count has reached its limit.

## What Changes

- Translate the SDK unsupported-format error to `暂不支持该格式` when a user sends a non-text message to an AI P2P conversation.
- Normalize group-member-limit join failures to the localized app copy `群组人数达到上限`.
- Normalize common raw SDK English errors before they reach app toasts or inline error states.
- Keep existing successful send, media picker, and team join behavior unchanged outside these error cases.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `chat-detail`: AI P2P conversations must localize unsupported non-text send errors without blocking the send entry.
- `team-settings-and-members`: joining a group that has reached its member limit must show localized group-limit feedback.
- `native-toast-feedback`: app-visible SDK errors must be normalized before display.

## Impact

- Affected code: chat detail send-entry handlers, team join error handling, app localization, SDK error normalization, inline error state normalization.
- No API, dependency, route, or persistent data changes.
