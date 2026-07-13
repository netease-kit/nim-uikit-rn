## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Newly created teams use a seeded default avatar

- **WHEN** the user creates a new advanced team from the conversation picker
- **THEN** the create-team request MUST include one seeded default group avatar
- **AND** the resulting created team MUST not fall back to an empty avatar
