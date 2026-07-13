# Proposal

## Why

When the user opens message preview from pinned messages or collections, the page is acting as an archived-message viewer rather than an in-conversation preview. The bottom composer should not be shown in those read-only entry paths.

## What Changes

- allow the message preview page to hide its bottom composer for archived entry sources
- mark pinned-message and collection entry paths as archived preview sources
- keep the composer visible for normal message preview entry paths

## Impact

- affected spec: `message-preview-entry-behavior`
- affected code: `app/chat/message-preview.tsx`, `app/chat/pins.tsx`, `app/user/collection.tsx`
