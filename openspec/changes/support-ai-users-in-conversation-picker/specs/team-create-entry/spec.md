## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Picker shows all configured AI users

- **WHEN** the conversation picker page loads under an AppKey that has configured AI users
- **THEN** the page MUST display all configured AI users in the selectable member list

#### Scenario: Picker empty state without friends or AI users

- **WHEN** the conversation picker page has no available friends and no configured AI users
- **THEN** the page MUST show the empty-state placeholder instead of a selectable list
