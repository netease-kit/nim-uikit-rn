# Align Joined Team List Behavior

## Why

The contact test suite expects the joined-team list to behave like a current membership surface: teams are ordered by creation time, membership changes are reflected promptly, and leaving or dismissing a team from its chat settings returns the user to the joined-team list with the stale conversation removed.

The current implementation opens the joined-team list correctly, but sorts teams by name and returns to the contacts tab after leave/dismiss without explicitly deleting the team conversation.

## What Changes

- Sort joined teams by `createTime` descending.
- Keep team list refresh behavior on team create/join/leave/dismiss/member events.
- After leave or dismiss from team settings, delete the corresponding local conversation data and return to `/contacts/teamlist`.

## Impact

- Affected surfaces: `app/contacts/teamlist.tsx`, `app/team/settings.tsx`, `stores/TeamStore.ts`.
- No new dependencies.
- Validation uses targeted lint, TypeScript, and OpenSpec validation.
