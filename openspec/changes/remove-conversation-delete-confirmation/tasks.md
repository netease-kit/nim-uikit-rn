## 1. Spec Alignment

- [x] 1.1 Record that conversation-list deletion should execute without a secondary confirmation sheet.
- [x] 1.2 Confirm the current RN flow shows an extra delete confirmation ActionSheet after the user already chose delete.

## 2. Implementation And Verification

- [x] 2.1 Update `app/(tabs)/index.tsx` so conversation deletion runs immediately from swipe and long-press entry points.
- [x] 2.2 Preserve offline failure handling and in-flight duplicate protection for the direct delete path.
- [x] 2.3 Validate the change with OpenSpec, typecheck, and Expo startup verification.
