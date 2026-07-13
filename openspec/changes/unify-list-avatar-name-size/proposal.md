## Why

The RN app currently uses inconsistent avatar and nickname sizes across list-style pages such as contacts, search results, selection pickers, blacklist, and team member lists. This diverges from the conversation list baseline and creates uneven visual rhythm across core IM surfaces.

## What Changes

- Use the conversation list avatar size as the shared list baseline.
- Use the conversation list nickname font size as the shared list baseline.
- Apply the shared baseline to list-style pages that render avatar-and-name rows.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `list-identity-display`: List-style avatar and nickname rows align to the conversation list sizing baseline.

## Impact

- Affected code: list-style pages under `app/` that render avatar-and-name rows
- Affected behavior: visual consistency of avatar and nickname sizing
