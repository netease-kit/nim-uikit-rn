## 1. Spec And Layout Scope

- [x] 1.1 Record the my-detail safe-area regression in the OpenSpec change artifacts.
- [x] 1.2 Confirm the page container is missing top safe-area padding.
- [x] 1.3 Confirm the direct child pages from my-detail are missing the same top safe-area padding.

## 2. Implementation And Validation

- [x] 2.1 Update `/user/my-detail` and its direct child pages to reserve top and bottom safe-area spacing in the page container.
- [x] 2.2 Verify the change with OpenSpec validation, lint, TypeScript typecheck, and Expo startup validation.
