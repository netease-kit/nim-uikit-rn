## Why

Web Vue3 can send video attachments whose NOS URL has no filename extension while the attachment metadata carries `.mov`. iOS downloads that media successfully, but the in-app viewer can fail to recognize the cached or remote video when the extension metadata is dropped.

## What Changes

- Preserve video attachment extension metadata when downloading remote video messages for playback.
- Let the media viewer build iOS-capable video sources from attachment `name`/`ext` metadata for extensionless NOS URLs.
- Keep existing image handling, file-message preview routing, and Android playback behavior unchanged.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-message-content`: Video attachment playback must support Web Vue3 video payloads with extensionless NOS URLs and `.mov` attachment metadata on iOS.

## Impact

- Affected code: `app/chat/[id].tsx`, `app/chat/media-viewer.tsx`
- Affected behavior: iOS in-app viewing of normal video messages sent by Web Vue3
- No API, dependency, or backend impact.
