## ADDED Requirements

### Requirement: Conversation Online Status Refresh

The system SHALL refresh P2P friend online/offline status in the conversation list when subscribed user status changes are received.

#### Scenario: Android friend status updates conversation list

- **GIVEN** the conversation list runs on Android
- **AND** a P2P friend row is subscribed through the shared UIKit user-status source
- **WHEN** that friend logs in or logs out
- **THEN** the conversation row online indicator MUST update from the received user-status change without requiring a manual refresh
