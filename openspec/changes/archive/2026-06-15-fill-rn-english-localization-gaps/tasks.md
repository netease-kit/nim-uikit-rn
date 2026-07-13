## 1. Spec Alignment

- [x] 1.1 Record that English language preference must cover RN primary flows and RN UIKit adapter copy.
- [x] 1.2 Record conversation list, chat detail, and contacts home localization expectations in OpenSpec.

## 2. Implementation

- [x] 2.1 Add missing translation keys required by RN primary flows to `utils/app-language.ts`.
- [x] 2.2 Replace high-traffic hardcoded Chinese copy in conversation, contacts, and chat RN pages with translated copy.
- [x] 2.3 Replace hardcoded Chinese copy in `src/NEUIKit/rn` adapter components used by those flows with translated copy.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run TypeScript validation after the localization updates.
- [x] 3.3 Verify that English language shows English copy on conversation, contacts, and chat primary flows.
