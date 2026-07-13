## Why

Entering a 3000-member team conversation still stalls Android because the chat screen eagerly loads the full team member list and then fetches profiles for every member. Chat entry only needs team metadata, current-user role, visible message senders, and mention candidates when the mention picker is opened.

## What Changes

- Defer full team-member loading when opening a team chat.
- Load the current user's team-member record and a bounded first page of 150 team members on chat entry without marking the full member list as loaded.
- Keep full member loading for flows that need it, such as the mention picker and team member management pages.
- Render large team member lists with demand-driven pagination, footer loading, and visible-row profile fetching instead of loading all members and profiles at once.
- De-duplicate concurrent full-member and by-id member requests for the same team.

## Capabilities

### New Capabilities

- `heavy-im-lists`: Large-account and large-team IM screens avoid repeated or unnecessary full-list work during primary navigation and chat entry.

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/[id].tsx`, `app/team/members.tsx`, `stores/TeamStore.ts`
- Affected behavior: team chat entry and team member list performance for large groups.
- No API, dependency, backend, or visual-design impact.
