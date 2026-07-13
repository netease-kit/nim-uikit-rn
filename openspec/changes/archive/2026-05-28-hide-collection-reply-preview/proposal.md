# Proposal

## Why

The collection page currently renders collected reply messages with the quoted source preview. The required collection view should show only the collected reply message content itself.

## What Changes

- Hide reply quoted-source previews in the collection page message preview card.
- Limit collected text-message previews to three lines with tail ellipsis in the collection page card.
- Rename the collection card remove action to delete and require confirmation before deletion.
- Show a delete-success toast and update the collection list after confirmed deletion succeeds.
- Keep normal chat detail reply rendering unchanged.
- Keep the full message-detail page unconstrained when opening a collected text message.

## Impact

- Affects only collected message previews under My > Collection.
- Does not change collection storage, opening the original message, forwarding, or chat detail reply rendering.
