## MODIFIED Requirements

### Requirement: Conversation List Pagination

The app SHALL support pagination for the conversation list when cloud conversation mode is enabled.

#### Scenario: Load additional cloud conversations

- **WHEN** the conversation list is using the cloud conversation store
- **AND** the user scrolls to the bottom of the current list
- **THEN** the app MUST request the next page from the cloud conversation service
- **AND** newly loaded conversations MUST merge without duplicates
- **AND** all available conversations MUST remain reachable through pagination
