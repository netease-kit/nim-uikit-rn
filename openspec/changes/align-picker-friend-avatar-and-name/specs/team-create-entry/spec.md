## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Picker shows friend names with contact priority

- **WHEN** the conversation picker renders a friend row
- **THEN** the displayed name MUST resolve in this priority order: friend alias, friend personal nickname, then accountId

#### Scenario: Picker shows friend avatars with fallback initials

- **WHEN** the conversation picker renders a friend row
- **THEN** the row MUST show the friend preset avatar when one exists
- **AND** when no preset avatar exists, the row MUST show a generated default avatar using the last two characters of the resolved display name
