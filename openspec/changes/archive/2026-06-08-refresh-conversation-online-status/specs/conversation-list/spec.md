## ADDED Requirements

### Requirement: Conversation Online Status Refresh

The system SHALL refresh P2P friend online/offline status in the conversation list when subscribed user status changes are received.

#### Scenario: Friend login updates conversation list

- **WHEN** a subscribed P2P friend logs in
- **THEN** the conversation list updates that friend's online indicator without requiring a manual refresh

#### Scenario: Friend logout updates conversation list

- **WHEN** a subscribed P2P friend logs out or terminates the app
- **THEN** the conversation list updates that friend's offline indicator without requiring a manual refresh
