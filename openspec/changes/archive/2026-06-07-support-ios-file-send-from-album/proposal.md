# Support iOS File Sends From Album

## Summary

Allow the RN iOS chat file action to choose either system Files/iCloud content or photo-library content, matching the native iOS IMUIKit file action.

## Motivation

The current RN file action opens only the document picker. On iOS this limits file messages to Files/iCloud sources, while the native iOS implementation lets users send photo-library images and videos as file messages from the same file action flow.

## Scope

- Add an iOS-only source choice when the user taps the chat file action.
- Reuse the existing RN photo-library permission and limited-media picker flow for album content.
- Send selected album photos and videos as file messages when opened from the file action.
- Keep the existing Android file action behavior unchanged.

## Non-goals

- Do not change normal image/video action semantics.
- Do not add new native modules or dependencies.
- Do not change file upload size limits.
