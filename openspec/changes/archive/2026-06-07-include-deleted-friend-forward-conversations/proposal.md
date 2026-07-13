# Proposal

## Why

The forwarding target page currently filters P2P recent-chat targets by current friend relationship. After deleting a friend, the existing conversation can remain visible in the main conversation list, but that same conversation disappears from Recent Chats and may disappear from Recent Forward on the forwarding page. This prevents forwarding to a still-existing conversation.

## What Changes

- keep P2P conversations that still exist in the local conversation list as valid forwarding targets even when the peer is no longer a friend
- keep stale P2P targets without a local conversation filtered out
- preserve existing friend and group forwarding target behavior

## Impact

- affected spec: `chat-forwarding-and-selection`
- affected code: `app/chat/forward.tsx`
