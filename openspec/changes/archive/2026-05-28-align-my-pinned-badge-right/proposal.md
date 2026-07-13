# Proposal

## Why

Pinned-message tip text in the chat detail timeline is always anchored to the left edge of the message bubble wrapper. For messages sent by the current user, this makes the pinned tip visually detach from the right-aligned outgoing bubble.

## What Changes

- Right-align the pinned tip row under current-user messages with the outgoing message bubble.
- Keep pinned tip rows under other users' messages left-aligned as they are today.

## Impact

- Affects chat detail pinned-message presentation only.
- Does not change pin state, pin operations, pinned-message list behavior, or pinned tip copy.
