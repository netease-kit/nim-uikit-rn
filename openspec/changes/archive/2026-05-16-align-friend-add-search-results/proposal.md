# Proposal

## Why

The add-friend screen currently auto-navigates to the profile card as soon as an account search succeeds. This differs from the Web/H5 UIKit behavior, where the current page stays visible and renders the matched account as a search result row for the user to act on.

## What Changes

- Keep the user on the add-friend screen after a successful account search.
- Render the matched account in a result list row below the search bar.
- Let the user tap the row or its action button to open the profile card.

## Impact

- Affects the user-visible add-friend flow under `app/friend/add.tsx`.
