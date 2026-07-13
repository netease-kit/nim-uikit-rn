## 1. Specification

- [x] 1.1 Add OpenSpec proposal and RN UIKit icon rendering requirement
- [x] 1.2 Validate the OpenSpec change

## 2. Implementation

- [x] 2.1 Inspect RN UIKit icon rendering and page icon call sites
- [x] 2.2 Update `UIKitIcon` to render local static PNG icons through React Native's built-in image component
- [x] 2.3 Preserve existing icon API, sizing, tinting, and style behavior

## 3. Verification

- [x] 3.1 Run TypeScript, lint, and whitespace validation
- [x] 3.2 Verify Metro status and Android overwrite install behavior on port 8081
