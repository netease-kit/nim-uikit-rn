## 1. Notification Behavior

- [x] 1.1 Apply workbook dependency rules on the message-notification settings page.
- [x] 1.2 Bind notification preference changes to current Expo notification presentation and Android channel configuration where supported.
- [ ] 1.3 Clear presented notifications and badge state after notification tap routing.

## 2. Language Override

- [x] 2.1 Add an app-level translation layer for the My/settings/profile route chain.
- [x] 2.2 Apply saved language overrides immediately after saving and restore them on later launches.
- [x] 2.3 Replace hard-coded Chinese copy across the RN core user flow and store/util-generated user-visible text with the shared i18n layer.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run TypeScript checks for the updated notification and language paths.
- [ ] 3.3 Re-check `0064-0082` and `0088-0093` expectations against the updated code paths.
