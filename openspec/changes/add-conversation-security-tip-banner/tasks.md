## 1. Spec Alignment

- [x] 1.1 Record the conversation-list security-tip banner requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0271` currently fails because the RN conversation page does not render the yellow anti-fraud banner.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/(tabs)/index.tsx` so the messages page shows the yellow security-tip banner in the required position.
- [x] 2.2 Re-verify testcase `0271-防诈骗提示小黄条` only, and do not advance to the next testcase until it passes.
