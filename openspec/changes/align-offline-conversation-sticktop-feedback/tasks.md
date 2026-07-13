## 1. Spec Alignment

- [x] 1.1 Record the offline stick-top failure feedback requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0238` currently lacks an explicit offline pre-check before toggling conversation stick-top.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/(tabs)/index.tsx` so stick-top and cancel stick-top are blocked offline with the required prompt.
- [x] 2.2 Re-verify testcase `0238-无网络取消置顶-置顶会话` only, and do not advance to the next testcase until it passes.
