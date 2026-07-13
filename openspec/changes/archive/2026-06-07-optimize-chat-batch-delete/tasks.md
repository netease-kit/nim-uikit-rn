## 1. Native Reference

- [x] 1.1 Confirm Android native multi-select deletion uses batch message deletion.
- [x] 1.2 Confirm iOS native multi-select deletion uses batch message deletion and a 50-message limit.

## 2. Implementation

- [x] 2.1 Add RN store support for deleting multiple messages through the SDK batch delete API.
- [x] 2.2 Batch local timeline removal and preview refresh after deletion.
- [x] 2.3 Update chat multi-select deletion to allow exactly 50 messages and call the batch store API.
- [x] 2.4 Update SDK deletion notification handling to remove messages in a batch.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
