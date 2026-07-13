## Why

Muted conversations still need to indicate that new unread messages exist at the bottom conversation tab level. The current tab dot calculation excludes muted conversations, so a muted conversation can receive unread messages without any bottom tab red-dot signal.

## What Changes

- Include muted conversation unread counts when deciding whether to show the bottom Messages tab red dot.
- Keep the existing conversation row behavior where muted conversations show a dot instead of a numeric unread badge.
- Keep notification and background unread behavior unchanged.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `conversation-list-behavior`: bottom conversation tab unread dot includes muted conversations.

## Impact

- Affects bottom tab unread-dot calculation in `app/(tabs)/_layout.tsx`.
- No SDK, native, or dependency changes.
