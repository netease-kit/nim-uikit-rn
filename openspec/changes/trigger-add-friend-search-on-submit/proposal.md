# Proposal

## Why

The add-friend page currently triggers account lookup while the user is typing. This causes unnecessary live searches and does not match the expected interaction where lookup should happen only after the user explicitly submits from the keyboard.

## What Changes

- stop automatic add-friend search while typing
- trigger add-friend search only when the user submits from the keyboard search action
- clear stale search results when the input content changes after a search

## Impact

- affected spec: `friend-add-search`
- affected code: `app/friend/add.tsx`
