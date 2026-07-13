## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Offline create action shows required prompt

- **WHEN** the user selects valid contacts on the conversation picker page, loses network connectivity, and taps the create action
- **THEN** the app MUST keep the user on the picker page
- **AND** the app MUST show the message `当前网络不可用，请检查你的网络设置`
