## 1. Spec Alignment

- [x] 1.1 Update verification-center behavior to include a profile-card entry for visible verification records.

## 2. Implementation

- [x] 2.1 Make verification record account areas open the peer profile card.
- [x] 2.2 Preserve agree/reject actions for inbound pending records.
- [x] 2.3 Filter verification records sent by the current account while keeping processed inbound records visible.
- [x] 2.4 Show inbound pending verification count on the Contacts verification shortcut and clear it when the shortcut is opened.

## 3. Validation

- [x] 3.1 Validate OpenSpec, formatting, and targeted lint.
- [x] 3.2 Hot-update Metro 8081 to Android and verify the Contacts verification shortcut remains stable without pending inbound data; pending-count behavior is code-verified and requires an inbound application to manually exercise.
