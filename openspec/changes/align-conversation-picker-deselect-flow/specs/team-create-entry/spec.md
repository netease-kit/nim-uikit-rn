## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Deselecting contacts from the picker list

- **WHEN** the user toggles an already-selected friend or AI user from the conversation picker list
- **THEN** that account MUST be removed from the current manual selection set

#### Scenario: Deselecting contacts from the selected-member strip

- **WHEN** the user taps a selected friend or AI user avatar from the selected-member strip
- **THEN** that account MUST be removed from the current manual selection set
- **AND** a subsequent create action MUST only include accounts that remain selected at submit time
