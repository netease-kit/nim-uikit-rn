## 1. Spec Alignment

- [x] 1.1 Record the first-load loading and empty-state switching rule for the conversation list.

## 2. Implementation And Verification

- [x] 2.1 Keep the conversation list in loading state until the first fetch has either returned data or confirmed an empty result.
- [x] 2.2 Delay empty-state exposure enough to avoid first-render flicker when list data is still settling.
- [x] 2.3 Preserve the normal empty-state display once the first load is complete and the list is still empty.
