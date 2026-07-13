# Fix iOS image message display

## Why

Image messages sent from other clients can carry NOS media URLs using `http://nim-nosdn...`. On the current iOS simulator, these image requests fail with `NSURLErrorDomain Code=-1022` because the runtime rejects insecure loads under App Transport Security, so the chat timeline shows image placeholders instead of the received photos.

## What changes

- Normalize render-time media URLs for known HTTPS-capable NOS hosts from `http` to `https`.
- Keep local file paths and non-NOS URLs unchanged.
- Reuse the existing image/media source helper so chat bubbles and media preview paths stay consistent.

## Impact

- Affects RN rendering of image messages and shared media preview source selection.
- Does not change message sending, stored attachment metadata, or SDK upload behavior.
