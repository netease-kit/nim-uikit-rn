## 1. Spec And Cross-Platform Alignment

- [x] 1.1 Record the invalid team conversation cleanup requirement in OpenSpec.
- [x] 1.2 Confirm the shared behavior from other clients for dismissed, left, or kicked team conversations.

## 2. Implementation And Validation

- [x] 2.1 Update RN conversation synchronization and team-event handling so invalid team conversations are removed from the list automatically.
- [x] 2.2 Guard team-conversation navigation so stale rows cannot open a broken chat detail page.
- [x] 2.3 Verify the fix with OpenSpec validation, lint, TypeScript typecheck, and Expo startup validation.
