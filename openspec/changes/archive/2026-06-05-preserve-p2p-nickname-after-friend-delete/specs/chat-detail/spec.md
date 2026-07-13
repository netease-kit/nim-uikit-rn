## ADDED Requirements

### Requirement: Chat Detail Identity Display

The chat detail screen SHALL render the current conversation identity using the shared UIKit appellation rules.

#### Scenario: P2P chat header target nickname survives friend deletion and cold login

- **GIVEN** the user previously chatted with account A
- **AND** account A has a cloud user profile nickname
- **AND** account A has been deleted from the user's friend list
- **AND** the app has been uninstalled and reinstalled so local user caches are empty
- **WHEN** the user opens the historical P2P chat with account A
- **THEN** the chat header MUST resolve and display A's cloud profile nickname
- **AND** it MUST NOT fall back to displaying A's account ID while the profile can be fetched
