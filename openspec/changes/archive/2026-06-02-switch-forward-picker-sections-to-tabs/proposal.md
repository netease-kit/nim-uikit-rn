## Why

The forwarding target picker currently stacks Recent Chats, My Friends, and My Groups below the search field, which makes the page long and harder to scan. The picker should use the same tabbed switching pattern as the UIKit forwarding baseline while keeping RN-specific recent-chat support.

## What Changes

- Add tabs directly below the forwarding picker search field for Recent Chats, My Friends, and My Groups.
- Show only the active tab's target list while preserving each list's existing filtering, empty state, selection, and invalid-target handling.
- Keep the recent-forward shortcut strip separate from the new tabs.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: forwarding target selection layout changes from stacked sections to search-adjacent tab switching for the three target categories.

## Impact

- Affected code: `app/chat/forward.tsx`
- Affected behavior: forwarding target picker category navigation and search-result display
- No API, dependency, or store model changes
