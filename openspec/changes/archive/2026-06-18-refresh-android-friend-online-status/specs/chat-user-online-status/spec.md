## MODIFIED Requirements

### Requirement: RN Online Status Uses Subscription Events

The chat detail screen SHALL keep the P2P peer online/offline status in the header synchronized with the shared UIKit user-status source.

#### Scenario: Android friend status updates chat detail

- **GIVEN** the chat detail screen runs on Android
- **AND** the current conversation is a P2P friend chat
- **WHEN** that friend logs in or logs out
- **THEN** the chat header online/offline label MUST update from the received user-status change without requiring a manual refresh
