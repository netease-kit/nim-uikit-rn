## 1. Spec Alignment

- [x] 1.1 Record the cloud-conversation source-selection requirement in OpenSpec.
- [x] 1.2 Confirm the RN bridge currently prefers `localConversationStore` even when cloud conversation mode is enabled.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `stores/ImStoreV2Bridge.ts` so cloud mode prefers `conversationStore` for conversations and total unread.
- [x] 2.2 Re-verify the current cloud-conversation testcase in scope before advancing.
