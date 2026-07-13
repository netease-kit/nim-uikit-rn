## MODIFIED Requirements

### Requirement: Conversation List Layout And Empty State

The conversation list SHALL render conversation rows with identity, unread state, mute/stick-top indicators, preview text, timestamps, and p2p online status where applicable.

#### Scenario: P2P conversation status updates

- **WHEN** a one-to-one conversation row is visible
- **THEN** the app subscribes to that peer's user status
- **AND** the row shows `在线` when the peer status is online
- **AND** the row shows `离线` when the peer status is offline or unknown

#### Scenario: P2P conversation title updates after alias edit

- **GIVEN** a one-to-one conversation row is visible in the conversation list
- **WHEN** the user edits that friend's remark name and returns to the conversation list
- **THEN** the row title updates to the new remark name without requiring a pull-to-refresh
