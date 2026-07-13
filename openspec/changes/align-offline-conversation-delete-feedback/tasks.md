## 1. Spec Alignment

- [x] 1.1 Record the offline delete failure feedback requirement in OpenSpec.
- [x] 1.2 Confirm the current delete flow lacks an explicit offline pre-check.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/(tabs)/index.tsx` so delete conversation is blocked offline with the required prompt.
- [x] 2.2 Re-verify testcase `0287-无网络删除会话` before advancing to the next case.
