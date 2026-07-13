## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Search result warns when a team has been dismissed or removed

- **WHEN** the user taps a team result from the conversation search page
- **AND** that team is no longer available locally
- **THEN** the app MUST show an alert titled `离开群聊`
- **AND** the alert message MUST be `您已被移出群聊或群聊已解散`
