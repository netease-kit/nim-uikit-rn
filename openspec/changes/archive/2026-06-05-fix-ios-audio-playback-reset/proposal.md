## Why

iOS voice messages can enter a playing state without audible output and remain visually playing after the expected audio duration. This breaks the chat detail voice playback flow and leaves the message bubble animation stuck.

## What Changes

- Restore a dedicated playback audio mode before voice message playback so iOS exits recording-oriented audio routing.
- Normalize voice attachment sources, prefer the remote URL for received voice messages, and upgrade HTTPS-capable NOS HTTP URLs before passing them to the native audio player.
- Clear the active playing state after the expected voice duration even if iOS does not emit a terminal playback status.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audio-playback`: Voice message playback must use a playable source on iOS, be audible, and reset the playing indicator after playback completes or times out.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected runtime: Expo iOS voice message playback through `expo-audio`
