## Why

Some list pages render rows as disabled while a navigation lock is active. If the page re-renders after a row press and then returns from the chat page, the lock ref is cleared on focus but the rendered disabled state can remain stale, making subsequent rows unclickable.

## What Changes

- Make navigation-lock state changes observable by React rendering.
- Ensure returning to search results or joined-team lists clears the rendered disabled state.
- Preserve duplicate-tap protection during active navigation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `conversation-search-and-picker`: Search result rows must remain navigable after returning from chat.
- `contact-blacklist-and-teams`: Joined-team rows must remain navigable after returning from chat.

## Impact

- Affected code: `hooks/useNavigationLock.ts`
- Affected behavior: pages that disable rows through `isNavigationLocked()`
- No API, dependency, route, or SDK behavior changes.
