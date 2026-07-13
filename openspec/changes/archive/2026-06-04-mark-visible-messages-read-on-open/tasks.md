## 1. OpenSpec Contract

- [x] 1.1 Create proposal for immediate visible-message read receipts
- [x] 1.2 Add scenario for receiving messages while already in chat detail

## 2. Implementation

- [x] 2.1 Add a read-receipt sender for newly received messages in the active conversation
- [x] 2.2 Trigger that sender from the global message receive event
- [x] 2.3 Make sent-message read indicators observe read-receipt store changes
- [x] 2.4 Refresh affected sent-message rows when P2P/team read receipts are applied

## 3. Validation

- [x] 3.1 Validate the OpenSpec change
- [x] 3.2 Run lint and TypeScript checks
