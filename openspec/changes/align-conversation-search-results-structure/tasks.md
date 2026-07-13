## 1. Spec Alignment

- [x] 1.1 Record the conversation-search grouped-result and highlight requirements in OpenSpec.
- [x] 1.2 Confirm testcase `0211` currently fails because the RN search page mixes result types without grouping or highlight.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/conversation/search.tsx` to group friend and team matches with dividers and keyword highlighting.
- [x] 2.2 Re-verify testcase `0211-输入内容搜索` only, and do not advance to the next testcase until it passes.
