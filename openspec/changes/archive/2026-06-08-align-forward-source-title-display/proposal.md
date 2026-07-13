## Why

Batch forwarding confirmation currently can show the wrong source conversation title for P2P chats, and the same title is also reused for merged-forward message payloads. This conflicts with native behavior where local confirmation can use friend remarks, but sent merged-forward cards must not expose the sender's local remark.

## What Changes

- Split the source conversation title into a local display title and a sent payload title.
- Use remark > user nickname > account ID for P2P titles shown in batch forward confirmation.
- Use user nickname > account ID for P2P merged-forward payload titles so recipients do not see sender-local remarks.
- Keep team source titles as the team name in both confirmation and merged-forward payloads.

## Capabilities

### New Capabilities

- `chat-forwarding`: Chat message forwarding confirmation and merged-forward payload title behavior.

### Modified Capabilities

None.

## Impact

- Affected routes: `app/chat/[id].tsx`, `app/chat/forward.tsx`.
- Affected flow: merged forwarding and one-by-one forwarding confirmation from chat multi-select mode.
- No SDK, dependency, or navigation API changes.
