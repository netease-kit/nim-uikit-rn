# Fix iOS File Open After Download

## Summary

Fix RN iOS file messages so downloaded local files open through the native iOS document sharing/preview flow instead of failing with `Unable to open URL`.

## Motivation

The current RN file open helper calls React Native `Linking.openURL(file://...)` for iOS local sandbox files. On physical iPhone this can fail after a file message downloads successfully because `Linking` is URL-scheme oriented and does not provide a document interaction controller for arbitrary local file paths.

## Scope

- Use an iOS document sharing/preview capable API for local file message opens.
- Preserve Android's existing content-URI intent open path.
- Keep existing file download and local persistence behavior unchanged.

## Non-goals

- Do not change attachment rendering.
- Do not change file download progress behavior.
- Do not add custom native code.
