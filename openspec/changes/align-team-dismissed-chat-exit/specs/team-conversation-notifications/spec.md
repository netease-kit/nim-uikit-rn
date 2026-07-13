## MODIFIED Requirements

### Requirement: Team Dismissal Feedback Inside Chat

The app SHALL notify the user and exit the chat page when the currently opened team conversation is dismissed.

#### Scenario: Current team is dismissed while the user is on the chat page

- **WHEN** the user is viewing a team chat page and that team is dismissed
- **THEN** the app MUST show the message `当前群聊已解散`
- **AND** the alert MUST provide a confirmation action
- **AND** after the user confirms, the app MUST return to the conversation list page
