## Why

The通讯录 test case `0098` requires add-friend search to behave as an account exact-match flow: a full existing account opens the card, while a partial account reports that the user does not exist. The current RN page lists SDK search results and does not enforce that contract.

## What Changes

- Make the add-friend search page treat submitted input as an exact account lookup.
- When the entered account exists, navigate directly to the user card for that account.
- When the entered account does not exist, show the existing empty result state.
- Keep input, clear-button, self/friend/stranger card handling, and existing card actions intact.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `friend-search-and-card`: Clarify the add-friend search flow as exact account matching with direct card navigation on success.

## Impact

- Affected route: `app/friend/add.tsx`
- Affected store: `stores/UserStore.ts`
- Affected validation: contact test case `0098`, targeted lint, TypeScript, and OpenSpec validation.
