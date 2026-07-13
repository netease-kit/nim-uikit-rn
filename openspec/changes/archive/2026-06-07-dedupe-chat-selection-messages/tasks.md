## 1. Spec

- [x] 1.1 Record unique-message counting behavior for chat multi-select delete limits.

## 2. Implementation

- [x] 2.1 Deduplicate chat visible messages by message key before timeline rendering.
- [x] 2.2 Derive selectable ids and selected messages from the deduplicated visible-message list.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
