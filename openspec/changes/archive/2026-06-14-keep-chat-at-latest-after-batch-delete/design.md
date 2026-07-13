## Context

The chat detail page renders messages with an inverted `FlatList`; the latest message is at scroll offset `0`. Existing message-count handling only auto-scrolls when messages are added. When the message count decreases, the effect updates tracking refs and returns, allowing `maintainVisibleContentPosition` to keep an older visible row after the newest rows were deleted.

## Decision

Track whether the pending batch delete contains the current latest visible message before invoking the store deletion. If the following message-list update decreases the message count, explicitly align the inverted list to offset `0` after updating count refs.

This keeps historical batch deletes stable while fixing the latest-end delete case.

## Risks

- The store deletion is asynchronous, so the alignment must be tied to the message-list reduction instead of only running immediately after the delete promise resolves.
- The alignment must clear the pending flag whether the list shrinks or the delete path exits without removing local rows.
