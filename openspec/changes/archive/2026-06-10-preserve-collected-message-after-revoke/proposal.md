## Why

Collection entries currently deserialize the stored message snapshot, but the shared chat bubble still checks the live revoke map by conversation and message ID. After the original message is revoked, the collection list is overwritten by the revoke placeholder instead of showing the content that was collected.

Native Android and iOS collection lists render from the serialized message stored in the collection payload, so a later revoke of the original conversation message does not replace the collected content.

## What Changes

- Keep using the serialized collection message snapshot when rendering collection rows.
- Add a collection-list rendering mode that ignores the live chat revoke state for the collected message bubble.
- Preserve normal chat detail revoke rendering.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `message-collection`: collection rows preserve collected snapshot content after the source message is revoked.

## Impact

- Affects My > Collection message preview rendering.
- Does not change chat detail revoke rendering or collection storage format.
