# Fix Merged Forward Media Save Extension

## Why

Merged-forward detail opens image and video messages in the media viewer using only a raw URI. When that URI has no file extension, the media viewer cannot infer a valid local filename for the download/save action and the save flow fails with `cannot get file's extension`. Chat detail does not hit this because it opens the viewer with `conversationId` and `messageId`, allowing the viewer to read the original attachment name and extension.

## What Changes

- Pass attachment filename and extension metadata when merged-forward detail opens image or video messages.
- Let the media viewer use explicit filename/extension params for raw-URI media, and fall back to the media type's default extension when needed.

## Impact

- Affects saving image/video media opened from merged-forward detail and other raw-URI media viewer entries.
- Does not change ordinary chat-detail media viewer opening or media rendering.
