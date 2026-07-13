## Why

Directly recorded chat videos can fail during NOS upload with `413 Request Entity Too Large` even when similarly sized album videos send successfully. The two flows currently pass different file URI shapes into the SDK, so recorded videos need the same local-file normalization used by album media before sending.

## What Changes

- Normalize directly recorded video assets into the app sandbox before creating the video message.
- Generate upload previews and file-size validation from the normalized local video URI.
- Keep the existing 200 MB local pre-send validation and server-side upload failure feedback behavior.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-send-failure-feedback`: Recorded video sends use the normalized local file path before SDK send so upload behavior matches album-selected videos.

## Impact

- Affects `app/chat/[id].tsx` recorded video send preparation.
- Reuses existing file transfer helpers and does not change NIM SDK APIs.
