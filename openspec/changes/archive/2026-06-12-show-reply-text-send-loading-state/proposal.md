# Proposal: show-reply-text-send-loading-state

## Why

When sending a reply text message, the chat bubble does not show a visible sending state. Users can misread it as already sent, especially when the network is disconnected and the message later fails.

## What Changes

- show an explicit loading indicator for outgoing text reply messages while their sending state is still in progress
- align reply text sending feedback with the existing sending-state behavior used by other outgoing message types

## Impact

- affects outgoing text-message bubble feedback in `src/NEUIKit/rn/chat-message-bubble.tsx`
- especially improves disconnected or unstable-network reply flows
