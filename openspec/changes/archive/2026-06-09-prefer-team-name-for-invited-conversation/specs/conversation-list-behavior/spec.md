## MODIFIED Requirements

### Requirement: Conversation List Layout And Empty State

The conversation list SHALL render conversation rows with identity, unread state, mute/stick-top indicators, preview text, timestamps, and p2p online status where applicable.

#### Scenario: Invited team conversation shows team nickname

- **GIVEN** user A creates a team or discussion group and invites user B
- **WHEN** user B receives the team entry notification and sees the team conversation in the conversation list
- **THEN** the conversation row MUST show the team nickname from joined-team metadata when available
- **AND** it MUST NOT keep showing the raw team id merely because the conversation source name was initialized with that id
