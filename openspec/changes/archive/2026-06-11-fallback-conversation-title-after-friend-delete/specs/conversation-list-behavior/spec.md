## MODIFIED Requirements

### Requirement: Conversation List Layout And Empty State

The conversation list SHALL render conversation rows with identity, unread state, mute/stick-top indicators, preview text, timestamps, and p2p online status where applicable.

#### Scenario: P2P conversation title falls back after remote friend deletion

- **GIVEN** the current device still shows a P2P conversation row for account A
- **AND** another endpoint deletes account A from the current user's friend list
- **WHEN** the current device receives the friend-deletion synchronization and re-renders the conversation list
- **THEN** the row title MUST stop showing the old friend remark
- **AND** the row title MUST fall back to account A's personal nickname when available
