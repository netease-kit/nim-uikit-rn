# Proposal

## Why

RN voice message bubbles currently use a width scale that is close to, but not aligned with, the Android UIKit implementation. This causes sent or received voice messages to render with different visual lengths for the same duration across clients.

## What Changes

- Align RN voice message bubble width with Android's duration-based rule.
- Keep short voice messages at a fixed minimum width.
- Increase width proportionally after the short-message threshold.
- Cap long voice messages at a maximum bubble width while still respecting the RN chat content max width.

## Impact

- Affects voice message rendering in the RN chat timeline.
- Does not change voice recording, sending, playback, or attachment duration storage.
