## Why

Team conversations can stay locally excluded after the current user leaves or is removed from a team. If the same user later rejoins, the conversation row may still be filtered out and incoming team messages do not surface in the conversation list.

Team notification names also reuse cached team nicknames after the user leaves and rejoins, even though the expected post-rejoin notification copy should fall back to friend alias, personal nickname, or account id.

## What Changes

- Restore locally excluded team conversations when the current user joins or is re-added to a valid team.
- Refresh joined-team metadata and conversation sources after rejoin so new team messages can update the conversation list.
- Render team join, leave, invite, and kick notification participant names without stale team nickname priority.

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: team conversations removed after exit or kick must be restorable when the current user rejoins the same valid team.
- `team-conversation-notifications`: team membership notification names must ignore stale team nicknames after leave and rejoin.

## Impact

- `app/_layout.tsx`: team event handling for rejoin and member-join events.
- `stores/ConversationStore.ts`: restoration of excluded team conversation ids by team id.
- `utils/teamNotification.ts`: notification participant name resolution.
- OpenSpec specs for conversation list behavior and team notifications.
