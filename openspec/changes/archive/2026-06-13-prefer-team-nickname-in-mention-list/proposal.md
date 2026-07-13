## Why

The team chat `@` mention sheet can show a non-friend member's account ID even when that member has a group nickname or personal profile nickname. The mention picker should use the same user-facing name priority expected by native clients for team mentions.

## What Changes

- Resolve team mention candidate names with priority: group nickname, personal nickname, account ID.
- Preload user profiles for loaded team members when the mention sheet opens so non-friend personal nicknames can replace account ID fallback.
- Keep friend alias out of the team mention picker naming priority.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected UX: team chat mention picker display names and inserted mention tokens.
- No API or dependency changes.
