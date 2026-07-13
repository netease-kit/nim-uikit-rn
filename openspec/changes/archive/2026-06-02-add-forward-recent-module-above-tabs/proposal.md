## Why

Android and iOS forwarding selectors show Recent Forward as a top module before the target-category tabs, while the RN page currently renders recent-forward shortcuts inside the scroll list below the tabs. Aligning this placement makes the forwarding selector match native behavior and keeps recent-forward targets immediately accessible.

## What Changes

- Move the Recent Forward module above the Recent Chats / My Friends / My Groups tabs.
- Keep the module hidden when there are no recent-forward targets, matching native behavior.
- Preserve existing loading, retry, selection, validation, and recent-forward persistence behavior.

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: forwarding target selection placement changes so Recent Forward appears as a top shortcut module above the target tabs.

## Impact

- Affected code: `app/chat/forward.tsx`
- Affected behavior: forwarding target picker layout only
- Reference behavior: Android `forward_contact_selector_layout.xml` / `RecentForward`, iOS `NEBaseMultiSelectViewController` / `MultiSelectViewModel.loadRecentForward`
