## 1. Spec Alignment

- [x] 1.1 Record the invalid-team search-result alert requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0217` currently fails because the RN search page uses a generic invalid-team alert.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/conversation/search.tsx` to show the required alert when a searched team is no longer available.
- [x] 2.2 Re-verify testcase `0217-搜索后群聊解散或被移除群聊` only, and do not advance to the next testcase until it passes.
