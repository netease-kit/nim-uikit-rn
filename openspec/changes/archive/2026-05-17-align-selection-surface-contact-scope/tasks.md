## 1. Spec Alignment

- [x] 1.1 Record the cross-surface contact-scope rules in OpenSpec.
- [x] 1.2 Confirm testcase `0203` currently fails on the existing-team member picker and blacklist add-entry paths.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Align `app/team/member-picker.tsx` to include AI users and exclude existing members, self, and blacklisted friends.
- [x] 2.2 Add a blacklist picker flow that only shows eligible friends and excludes AI users.
- [x] 2.3 Re-verify testcase `0203-选择页面联系人显示` only, and do not advance to the next testcase until it passes.
- [x] 2.4 Keep the existing-team member picker empty/search-empty copy generic to invited members, because the list can include both friends and AI users.
