## 1. Spec

- [x] 1.1 Record the requirement that team-history pages proactively refresh sent-message read receipts after history loading.

## 2. Implementation

- [x] 2.1 Add a reusable MessageStore helper that selects refreshable sent team messages from a loaded history batch.
- [x] 2.2 Refresh team read receipts after both initial history loading and incremental history pagination for those messages.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run targeted repo validation for the read-receipt refresh change.
