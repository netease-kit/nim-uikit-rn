## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Picker create action reflects selected count

- **WHEN** the user manually selects one or more friends on the conversation picker page
- **THEN** the create action MUST display `创建(<selected-count>)` before submission
- **AND** the displayed count MUST reflect the current manual selection count on that page
