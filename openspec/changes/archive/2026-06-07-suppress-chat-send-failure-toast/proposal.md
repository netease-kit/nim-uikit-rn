## Why

Chat send failures already render failure state and reason on the failed message in the timeline. The extra toast duplicates that feedback, is inconsistent with other native platforms, and can be obscured by the iOS keyboard.

## What Changes

- Stop showing toast/modal feedback for chat message send failures.
- Keep failed message bubble status and failure reason as the user-facing feedback.
- Keep non-send-operation prompts such as permissions, validation, download/open failures, and action failures unchanged.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `chat-send-failure-feedback`: send failures must not show extra toast/modal feedback when message-level failure feedback exists.

## Impact

- Affects send-failure handling in `app/chat/[id].tsx`.
- No SDK, native, dependency, or data-model changes.
