## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Empty create action shows required prompt

- **WHEN** the user taps the create action on the conversation picker page without selecting any contact
- **THEN** the app MUST keep the user on the picker page
- **AND** the app MUST show the message `请选择联系人`
