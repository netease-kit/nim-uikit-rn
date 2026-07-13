## Why

The RN group creation picker and team invite picker currently include AI users as selectable candidates. This conflicts with the expected behavior that only real contacts should be selectable when creating groups or inviting members into a team.

## What Changes

- Remove AI user candidates from the group creation picker.
- Remove AI user candidates from the team member invite picker.
- Keep friend-based selection, search, and creation/invite behavior unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `team-create-entry`: Group creation selection only shows friend candidates.
- `team-invite-entry`: Team invite selection only shows friend candidates.

## Impact

- Affected code: `app/conversation/picker.tsx`, `app/team/member-picker.tsx`
- Affected behavior: group creation and group invite candidate sources
