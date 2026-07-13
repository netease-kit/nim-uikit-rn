## 1. Spec Alignment

- [x] 1.1 Define the collection rendering requirement for chat-detail-aligned message presentation.
- [x] 1.2 Record fallback behavior when original message lookup is unavailable.

## 2. Implementation

- [x] 2.1 Extract reusable RN UIKit chat message bubble rendering from the chat detail page.
- [x] 2.2 Update chat detail to use the shared message bubble without changing existing chat behavior.
- [x] 2.3 Update collection page to resolve collected source messages and render them through the shared bubble.
- [x] 2.4 Keep collection-specific source/action controls and preview fallback behavior.

## 3. Validation

- [x] 3.1 Validate OpenSpec change.
- [x] 3.2 Run targeted lint for changed files.
- [x] 3.3 Run TypeScript typecheck.
