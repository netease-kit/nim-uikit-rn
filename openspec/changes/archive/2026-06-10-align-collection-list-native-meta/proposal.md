## Why

The RN collection list currently reuses live UIKit appellation logic, so collected message sender avatar labels can resolve to friend remarks instead of the sender's personal profile. Its collection time and source metadata are also positioned differently from the native Android/iOS collection list.

## What Changes

- Align collection sender identity with native collection payload behavior.
- Ensure collection sender avatar fallback labels do not use friend remarks or team nicknames; they use personal nickname first, then account ID.
- Populate RN-created collection payloads with native-compatible `senderName`, `avatar`, and `conversationName` snapshot fields.
- Show native-aligned source copy under the sender title and move collection time to the bottom of the collection card.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `message-collection`: collection list sender identity and metadata presentation are aligned with native clients.

## Impact

- Affects `app/user/collection.tsx`, `stores/CollectionStore.ts`, and app localization strings.
- No SDK API, dependency, or navigation contract changes.
