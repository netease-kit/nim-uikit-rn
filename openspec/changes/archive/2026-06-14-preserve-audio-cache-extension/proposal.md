# Preserve Audio Cache Extension

## Summary

Fix RN iOS voice playback for remote audio attachments whose SDK metadata extension differs from the cache fallback extension.

## Motivation

An iPad reproduction showed a voice message with SDK metadata `ext=aac`, `size=9568`, and `dur=2647` was cached locally as a `.m4a` file because the remote URL had no filename extension and the playback cache fallback always used `m4a`. AVPlayer on iOS did not finish loading that mismatched local file and remained in `waitingToPlayAtSpecifiedRate`, while later `.m4a` voice messages played normally.

## Scope

- Use audio attachment metadata to choose the playback cache file extension.
- Preserve existing remote download, cache reuse, and playback behavior for normal `.m4a` messages.
- Keep the diagnostic logging in place until the iPad retest confirms the fix.
