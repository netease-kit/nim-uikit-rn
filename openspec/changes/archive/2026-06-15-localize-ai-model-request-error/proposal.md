## Why

AI chat notifications can still expose the raw English text `ai model request error`. The current error normalization only matches another wording variant, so this notification bypasses localization and appears directly in the timeline.

## What Changes

- Add the `ai model request error` wording variant to the existing AI model request failure localization mapping.
- Keep AI model request failures rendered through the existing localized app string.
- Improve the English fallback copy to a natural user-facing sentence.

## Capabilities

### Modified Capabilities

- `chat-send-failure-feedback`: AI model request failures must localize wording variants before they are rendered to the user.

## Impact

- Affected code: `utils/error-message.ts`
- Affected code: `utils/app-language.ts`
- Affected behavior: AI chat notification error copy
