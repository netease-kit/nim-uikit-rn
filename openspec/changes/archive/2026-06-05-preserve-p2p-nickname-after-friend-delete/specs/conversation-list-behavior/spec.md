## MODIFIED Requirements

### Requirement: Conversation List Layout And Empty State

The conversation list SHALL render conversation rows with identity, unread state, mute/stick-top indicators, preview text, timestamps, and p2p online status where applicable.

#### Scenario: P2P conversation target nickname survives friend deletion and cold login

- **GIVEN** the user previously chatted with account A
- **AND** account A has a cloud user profile nickname
- **AND** account A has been deleted from the user's friend list
- **AND** the app has been uninstalled and reinstalled so local user caches are empty
- **WHEN** the user logs in and views the historical P2P conversation with account A
- **THEN** the conversation row MUST resolve and display A's cloud profile nickname
- **AND** it MUST NOT fall back to displaying A's account ID while the profile can be fetched
