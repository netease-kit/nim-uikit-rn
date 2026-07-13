# Prefer remote image URL for rendering

## Why

Images sent from iOS Objective-C clients can include an attachment `path` that points to the sender's local file. The RN app currently renders images with `path || url`, so an unreadable remote-client local path can prevent the valid NOS `url` from displaying.

## What changes

- Use `attachment.url` before `attachment.path` when rendering or previewing image messages.
- Keep local `path` as the fallback for images that have not produced a remote URL yet.
- Keep video source selection unchanged so existing downloaded/local video behavior is not affected.

## Impact

- Affects RN chat image bubbles and media preview image lists.
- Does not change message sending, resend source selection, or attachment metadata.
