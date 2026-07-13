## MODIFIED Requirements

### Requirement: Bottom Navigation Unread Indicators

The app SHALL show unread indicators on bottom-tab entry points when relevant unread state exists.

#### Scenario: Messages tab reflects full unread total in cloud conversation mode

- **GIVEN** cloud conversation mode is enabled
- **AND** the current first page of the conversation list has no unread conversations
- **AND** later conversation pages still contain unread messages
- **WHEN** the app finishes loading the initial conversation state after login
- **THEN** the bottom messages tab icon MUST display a red unread dot without waiting for the user to load more pages
