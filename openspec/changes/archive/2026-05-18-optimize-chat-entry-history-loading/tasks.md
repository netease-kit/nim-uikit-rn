## 1. Spec And Loading Strategy

- [x] 1.1 Record the chat-entry and paged-history performance requirement in OpenSpec.
- [x] 1.2 Confirm the current RN chat entry path blocks on oversized first-screen history work.

## 2. Implementation And Validation

- [x] 2.1 Remove conversation-list pre-entry history blocking and let chat detail own asynchronous initial history loading.
- [x] 2.2 Switch the chat message timeline to a virtualized list and preserve existing bottom-alignment, reply-location, and load-more behavior.
- [x] 2.3 Reduce the initial history page size for chat entry while keeping paged history loading available.
- [x] 2.4 Reduce the conversation-list first-screen conversation window and add an explicit loading state during post-login initial fetch.
- [x] 2.5 Verify the change with OpenSpec validation, lint, TypeScript typecheck, and Expo startup.
