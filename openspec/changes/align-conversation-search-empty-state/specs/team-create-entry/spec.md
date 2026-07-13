## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Conversation search shows the standard empty state for no matches

- **WHEN** the user enters a non-empty keyword on the conversation search page
- **AND** no local friend or team matches are found
- **THEN** the page MUST display an empty-state placeholder illustration
- **AND** the page MUST display the text `该用户不存在`
