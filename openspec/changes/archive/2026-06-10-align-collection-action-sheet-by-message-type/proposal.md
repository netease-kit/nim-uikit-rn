# align-collection-action-sheet-by-message-type Proposal

## Why

The collection list overflow menu currently exposes a fixed set of actions. This causes two user-visible issues:

- Collected text/emoji items do not offer a copy action in the overflow menu.
- Collected audio items still expose forwarding, but should only allow deletion.

## What Changes

- Show `复制` for collection items when the item is a text message with copyable content.
- Hide `转发` for collection items when the item is an audio message, keeping only `删除`.
- Keep the existing delete confirmation flow and forward flow for other forwardable message types.

## Impact

- Affects My > Collection overflow menu only.
