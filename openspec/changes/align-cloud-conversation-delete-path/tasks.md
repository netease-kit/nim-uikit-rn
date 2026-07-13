## 1. Spec Alignment

- [x] 1.1 Record the cloud-mode delete-path requirement for the conversation list page.
- [x] 1.2 Confirm the current page logic still prefers `localConversationStore`.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/(tabs)/index.tsx` so conversation actions prefer `conversationStore` in cloud mode.
- [x] 2.2 Re-verify testcase `0284-删除会话` before advancing to the next case.
