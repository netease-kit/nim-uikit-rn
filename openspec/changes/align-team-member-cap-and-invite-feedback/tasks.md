## 1. Spec Alignment

- [x] 1.1 Record the advanced-team total member cap requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0224` currently fails because the RN create-team flow sets the total member limit to 200.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update the RN advanced-team create flow to use a 3000-member total cap while keeping the picker selection cap at 200.
- [x] 2.2 Re-verify testcase `0224-高级群-讨论组 人数上限3000` only, and do not advance to the next testcase until it passes.
