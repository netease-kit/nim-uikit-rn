## Why

Newly created group chats and discussion groups currently route join attempts through the "application sent" path even though their default policy is open join. Users who apply to join those teams should become members immediately and enter the chat.

## What Changes

- Create RN demo teams with the explicit free-join mode while keeping invitee approval disabled by default.
- Treat a successful free-join application as immediate membership, create the matching local conversation, and open the chat page.
- Keep the existing application-sent feedback for teams that require join approval.

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: new team and discussion creation must default to free join for applicants.
- `contact-blacklist-and-teams`: successful free-join application must refresh joined-team state and open the resulting team chat.

## Impact

- Affected code: `stores/TeamStore.ts`, `app/team/join.tsx`.
- Affected flows: creating group chats, creating discussion groups, applying to join teams from the join-team page, and opening the resulting chat conversation.
- No dependency or public API changes.
