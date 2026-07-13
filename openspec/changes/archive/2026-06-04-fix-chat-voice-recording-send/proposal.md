## Why

Voice recording in the RN chat screen can miss the release event when recording startup and stop callbacks race, leaving a completed recording unsent. The current outgoing audio sending state also shows text inside the voice bubble, blank chat taps do not dismiss the voice recording composer, and some SDK send failures can surface untranslated English messages such as `file upload failed`.

## What Changes

- Make the press-to-talk stop path reliable so releasing after a valid recording sends the audio message.
- Render outgoing audio messages in the sending state with a loading indicator before the voice bubble instead of a sending text label.
- Allow tapping blank chat content to dismiss the voice recording composer.
- Normalize known SDK send/upload failure messages before showing chat send-failure feedback.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-voice-messages`: refine recording release, sending indicator, and composer dismissal behavior for chat voice messages.
- `chat-send-failure-feedback`: require chat send-failure feedback to use localized display messages for known SDK errors.

## Impact

- affected code: `app/chat/[id].tsx`
- affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- affected code: `utils/error-message.ts`
- affected code: `utils/app-language.ts`
- affected specs: `chat-voice-messages`
- affected specs: `chat-send-failure-feedback`
