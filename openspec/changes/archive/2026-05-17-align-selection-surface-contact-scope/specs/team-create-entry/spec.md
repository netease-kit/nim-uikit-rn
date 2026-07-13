## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Creating from single-chat settings

- **WHEN** the user enters the picker from a p2p settings page
- **THEN** the picker excludes self, the current p2p target, and blacklisted contacts from manual selection while still auto-including the current p2p target in the created team

#### Scenario: Inviting members into an existing team

- **WHEN** the user opens the member-picker flow for an existing team
- **THEN** the selectable list MUST include current-account friends and configured AI users
- **AND** the list MUST exclude self, blacklisted friends, and accounts that are already members of that team
