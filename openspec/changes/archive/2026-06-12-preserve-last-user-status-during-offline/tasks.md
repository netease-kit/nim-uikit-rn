## 1. Spec And State Model

- [x] 1.1 Record the offline-preservation and reconnect-refresh requirements for chat, contacts, and conversation-list online status surfaces.
- [x] 1.2 Expose a reactive IM connection state source that user-status subscriptions can observe reliably.

## 2. User Status Cache Fix

- [x] 2.1 Update the shared RN user-status cache so local disconnection preserves the last known status instead of forcing subscribed accounts offline.
- [x] 2.2 Reconcile subscribed accounts to offline only after reconnect-time current-status synchronization confirms no online status for those accounts.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run targeted repo validation for the status-cache changes, including type/lint checks and Expo startup verification.
