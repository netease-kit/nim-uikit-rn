# Remove Message Tab Auto Scroll

## Why

Tapping the Messages bottom tab from another tab currently emits a request to jump the conversation list to the nearest unread row. The expected behavior is to switch tabs only and preserve the conversation list's current scroll position.

## What Changes

- Stop triggering nearest-unread positioning from the Messages bottom-tab press.
- Keep the existing tab navigation and unread red-dot display unchanged.

## Impact

- Affects bottom-tab interaction when entering the Messages tab from Contacts or Me.
- Does not change conversation row ordering, unread state, or other conversation-list refresh behavior.
