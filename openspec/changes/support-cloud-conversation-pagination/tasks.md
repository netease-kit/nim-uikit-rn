## 1. Spec Alignment

- [x] 1.1 Record the cloud-conversation pagination requirement in OpenSpec.
- [x] 1.2 Confirm the current RN conversation list blocks pagination whenever it uses bridge conversations.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Add cloud conversation pagination support in `stores/ImStoreV2Bridge.ts` and wire the list screen to use it.
- [x] 2.2 Re-verify testcase `0314-会话列表分页加载` before advancing.
