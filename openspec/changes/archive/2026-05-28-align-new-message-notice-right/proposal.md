# Proposal

## Why

The chat detail new-message notice is currently centered and uses generic copy. The required behavior is to place the notice on the right, show a down arrow before the copy, and display the number of new messages that arrived while the user is away from the bottom.

## What Changes

- Move the new-message notice module to the right side of the chat detail page.
- Add a down-arrow icon before the notice text.
- Replace the generic notice copy with count-based copy, such as `x条新消息`.
- Track the number of incoming messages accumulated while the notice is visible and reset it after scrolling to the bottom.

## Impact

- Affects only the chat detail new-message notice presentation and local notice count.
- Does not change message receiving, unread clearing, history loading, or conversation unread state.
