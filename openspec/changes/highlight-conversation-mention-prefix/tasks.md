## 1. Spec Alignment

- [x] 1.1 Record the conversation mention-highlight requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0272` currently fails because the RN row shows `有人@我` in the same muted color as the rest of the preview.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `src/NEUIKit/rn/components.tsx` so the `有人@我` prefix is rendered in red.
- [x] 2.2 Re-verify testcase `0272-会话列表@标识` only, and do not advance to the next testcase until it passes.
