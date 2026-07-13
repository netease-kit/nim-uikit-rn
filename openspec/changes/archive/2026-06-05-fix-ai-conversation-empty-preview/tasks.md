## 1. Spec And Diagnosis

- [x] 1.1 Record the AI conversation empty-preview regression in OpenSpec artifacts.
- [x] 1.2 Confirm whether the conversation list source lacks `lastMessage` while chat detail has loaded messages.

## 2. Implementation And Validation

- [x] 2.1 Add a local-message fallback for conversation-list preview and timestamp rendering when the source conversation has no `lastMessage`.
- [x] 2.2 Validate the change with TypeScript and OpenSpec validation.
