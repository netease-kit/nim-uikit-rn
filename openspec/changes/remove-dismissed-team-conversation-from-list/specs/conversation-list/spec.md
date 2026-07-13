## MODIFIED Requirements

### Requirement: Dismissed Team Removal From Conversation List

The app SHALL remove dismissed team conversations from the conversation list even when the user is not currently inside that chat page.

#### Scenario: Team dismissed while user is on another page

- **WHEN** a team conversation is dismissed while the user is on another page
- **THEN** the app MUST silently remove that team conversation from the conversation list
