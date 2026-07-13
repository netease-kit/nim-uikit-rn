## 1. Spec Alignment

- [x] 1.1 Record the active-chat unread reset expectation for the conversation list and chat detail flow.
- [x] 1.2 Confirm the current RN chat page only clears unread on initial entry and can leave stale unread badges after receiving messages.

## 2. Implementation And Verification

- [x] 2.1 Add a unified active-conversation unread reset path that works with the currently enabled conversation store.
- [x] 2.2 Trigger unread reset when the currently open conversation receives new messages in chat detail.
- [x] 2.3 Run repository validation required for chat and conversation behavior changes.
