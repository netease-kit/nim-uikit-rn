## 1. Native Reference

- [x] 1.1 Confirm Android native receive handling appends received message lists in one list update.
- [x] 1.2 Confirm iOS native receive handling keeps active-chat receive processing in the chat view model/controller path.

## 2. Implementation

- [x] 2.1 Add a short receive-message buffer to the RN NIM event bridge.
- [x] 2.2 Flush buffered incoming messages through the existing batch `messageStore.addMessages` path.
- [x] 2.3 Keep mention handling, read receipts, and conversation refresh running once per flushed batch.
- [x] 2.4 Clear pending receive buffers when the NIM event bridge is unbound.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
