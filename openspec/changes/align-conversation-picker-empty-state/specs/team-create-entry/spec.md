## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Picker shows the no-friend empty state

- **WHEN** the conversation picker page has no available friends and the user has not entered a search keyword
- **THEN** the page MUST show an empty-state illustration
- **AND** the page MUST show the `暂无好友` label
