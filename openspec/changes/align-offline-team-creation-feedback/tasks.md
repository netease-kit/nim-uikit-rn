## 1. Spec Alignment

- [x] 1.1 Record the offline team-creation feedback requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0225` currently lacks an explicit offline pre-check on the RN conversation picker flow.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/conversation/picker.tsx` to block offline team creation with the required prompt.
- [x] 2.2 Re-verify testcase `0225-断网创建高级群-讨论组` only, and do not advance to the next testcase until it passes.
