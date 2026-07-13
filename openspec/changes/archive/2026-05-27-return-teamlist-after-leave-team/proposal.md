## Why

Team exit operations invalidate the current team chat page. RN currently jumps to a fixed destination after leaving or dismissing from team settings, but the correct destination depends on the page that opened the now-invalid team chat.

## What Changes

- Align the team settings leave/dismiss success flow with stack-based back navigation.
- After a successful leave or dismiss, remove the exited team from local team state.
- Delete the related team conversation with message data cleared from the active conversation source.
- Return past the now-invalid team chat page to the previous still-valid page in the navigation stack.

## Capabilities

### New Capabilities

### Modified Capabilities

- `contact-blacklist-and-teams`: Align team settings exit cleanup with stack-based return behavior.

## Impact

- Affected code: `app/team/settings.tsx`
- Affected behavior: team settings leave/dismiss navigation and conversation cleanup
- No API or dependency changes.
