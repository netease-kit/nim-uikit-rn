## Why

On iOS, quickly tapping voice message 2 after voice message 1 can leave message 2 silent or show the native error `The operation couldn't be completed.` The playback hook stops and removes the previous `expo-audio` player and immediately starts the next one, which can race with iOS audio-session deactivation.

## What Changes

- Serialize voice-message playback requests in the shared playback hook.
- Add a short iOS-only settling delay after stopping an existing player before starting the next voice message.
- Ignore stale playback requests that are superseded by a newer tap.

## Capabilities

### New Capabilities

### Modified Capabilities

- `audio-playback`: Voice-message playback switching must remain audible when users rapidly tap different voice messages on iOS.

## Impact

- Affects `hooks/useMessageAudioPlayback.ts`, shared by chat detail, pinned-message list, source-message detail, and collection voice playback.
- No visual layout, SDK data, message sending, or recording-format changes.
