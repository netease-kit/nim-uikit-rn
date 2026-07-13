## 1. Specification

- [x] 1.1 Add OpenSpec proposal and audio-playback delta for rapid iOS voice switching.

## 2. Implementation

- [x] 2.1 Serialize voice playback requests inside the shared playback hook.
- [x] 2.2 Add an iOS-only settling delay after stopping an existing player before starting the next one.
- [x] 2.3 Guard asynchronous playback setup so stale requests cannot overwrite newer playback state.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run TypeScript and lint checks for the touched code.
- [x] 3.3 Verify Metro startup/status after implementation.
