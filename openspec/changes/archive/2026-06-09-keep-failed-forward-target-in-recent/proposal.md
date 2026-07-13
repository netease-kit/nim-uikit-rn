## Why

When forwarding to a user who has deleted or blocked the current account, the send fails. The app only records Recent Forward targets after successful sends and also filters stale P2P targets out of the Recent Forward module, so reopening the forward picker does not show that failed target.

## What Changes

- Record selected forwarding targets into Recent Forward after local validation and confirmation, before the remote send result returns.
- Allow persisted P2P Recent Forward targets to render even if the peer is no longer a friend and no retained conversation is available.
- Keep regular Recent Chats filtering for stale P2P targets unchanged.

## Impact

- Affected route: `app/chat/forward.tsx`
- Affected store: `stores/MessageStore.ts`
- Affected behavior: Recent Forward module after failed forwarding to deleted/blocked P2P targets
- No message payload, SDK API, or navigation contract changes.
