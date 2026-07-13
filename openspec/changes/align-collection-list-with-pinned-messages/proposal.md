# Proposal

## Why

The RN collection page currently renders message items with a card style that differs from the pinned-message list. Collections should use the same list presentation pattern so both archived-message views feel consistent.

## What Changes

- align the collection message list card shell with the pinned-message list card shell
- align collection item header, divider, and message preview area with the pinned-message page
- keep collection-specific source and action controls while reusing the pinned-message visual structure

## Impact

- affected spec: `collection-list-display`
- affected code: `app/user/collection.tsx`
