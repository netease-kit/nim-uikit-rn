## 1. Implementation

- [x] 1.1 Track explicit history-browsing state in the chat timeline.
- [x] 1.2 Prevent incoming remote messages and same-account cross-endpoint messages from auto-scrolling while history browsing is active.
- [x] 1.3 Defer rendering newly arrived latest messages while browsing history to avoid inverted-list shift and flicker.
- [x] 1.4 Keep the existing new-message notice/count visible until the user returns to the latest message.
- [x] 1.5 Move the RN iOS new-message notice slightly upward.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `npm run lint`.
- [x] 2.3 Validate the OpenSpec change.
- [x] 2.4 Confirm Metro on port `8081` is running.
