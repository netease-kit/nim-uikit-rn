# Proposal: defer-chat-media-permission-prompt

## Why

On iOS, the first entry into chat detail can immediately trigger the system photo-library permission dialog before the user taps any media action. This prompt timing is incorrect and breaks the expected chat-composer flow.

## What Changes

- defer any first-time photo-library permission request in chat detail until the user explicitly taps:
  - the image/video action in the composer toolbar
  - the "choose from album" option in the file source sheet
- keep limited-library refresh behavior only while the limited media picker is actually open

## Impact

- affects iOS chat detail media/file permission timing
- no intended behavior change for camera permission timing
- no intended behavior change for Android media/file flow
