## 1. Spec Alignment

- [x] 1.1 Record native-aligned multi-select forwarding action icon and color requirements.

## 2. Implementation

- [x] 2.1 Add native-style multi-select merge-forward, serial-forward, and delete icons.
- [x] 2.2 Update RN multi-select bottom actions to use distinct icons.
- [x] 2.3 Remove blue active tint from the multi-select bottom action icons.
- [x] 2.4 Keep marked message selection checkboxes visible above the pinned background in multi-select mode.
- [x] 2.5 Remove Android shadow from unselected message checkboxes while preserving their existing size.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
