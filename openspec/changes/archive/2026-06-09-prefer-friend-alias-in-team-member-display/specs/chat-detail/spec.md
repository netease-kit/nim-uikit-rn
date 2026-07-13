## MODIFIED Requirements

### Requirement: Chat Detail Identity Display

The chat detail screen SHALL render the current conversation identity and team message sender names using the shared UIKit appellation rules. In team chats, visible sender names SHALL refresh when the current highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Team chat sender name reflects display-name source changes

- **GIVEN** a team chat message from friend A is visible
- **AND** A has a team nickname
- **WHEN** the user opens A's friend card from the message avatar and changes the current highest-priority displayed name source
- **THEN** returning to the team chat MUST show A's updated sender name

#### Scenario: Team chat sender name falls back after display-name source deletion

- **GIVEN** a team chat message from friend A is visible
- **AND** A has a friend alias and a team nickname
- **WHEN** the user opens A's friend card from the message avatar and deletes the friend alias
- **THEN** returning to the team chat MUST show the next sender name according to the existing precedence

#### Scenario: P2P chat header target nickname survives friend deletion and cold login

- **GIVEN** the user previously chatted with account A
- **AND** account A has a cloud user profile nickname
- **AND** account A has been deleted from the user's friend list
- **AND** the app has been uninstalled and reinstalled so local user caches are empty
- **WHEN** the user opens the historical P2P chat with account A
- **THEN** the chat header MUST resolve and display A's cloud profile nickname
- **AND** it MUST NOT fall back to displaying A's account ID while the profile can be fetched
