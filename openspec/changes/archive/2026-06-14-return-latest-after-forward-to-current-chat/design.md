## Context

The forward confirmation screen calls `router.back()` before sending messages asynchronously. The source chat page therefore regains focus while still browsing older history. Its normal incoming/new-message logic intentionally preserves history position when `isBrowsingHistoryRef` is true, so the locally inserted forwarded message does not move the page to the latest end.

## Decision

Use `ForwardStore` to carry a one-shot pending "align forwarded target to latest" signal keyed by conversation id. The forward page sets this signal only when the forward target list includes the source conversation. The chat page consumes the signal when its message list grows and the latest added message is from the current account, then calls the existing `scrollToBottom(false)` path.

## Risks

- The signal must be consumed once so later unrelated incoming messages do not force-scroll the user.
- The signal must only be set for forwarding to the source/current conversation; forwarding to other targets should continue to preserve the source chat's historical browsing position.
