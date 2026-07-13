## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Team picker enforces a 200-contact limit

- **WHEN** the user has already selected 200 friends or AI users on the conversation picker page
- **AND** the user attempts to select one more account
- **THEN** the app MUST keep the new account unselected
- **AND** the app MUST show the message `最多只能选择200个联系人`
