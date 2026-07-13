## MODIFIED Requirements

### Requirement: Conversation List Layout And Empty State

The conversation list SHALL render conversation rows with identity, unread state, mute/stick-top indicators, preview text, timestamps, and p2p online status where applicable.

#### Scenario: P2P conversation status updates

- **WHEN** a one-to-one conversation row is visible
- **THEN** the app subscribes to that peer's user status
- **AND** the row shows `在线` when the peer status is online
- **AND** the row shows `离线` when the peer status is offline or unknown
