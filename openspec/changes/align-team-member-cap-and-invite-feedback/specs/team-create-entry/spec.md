## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Advanced teams reserve a 3000-member cap

- **WHEN** the app creates a new advanced team from the conversation picker
- **THEN** the create-team request MUST set the team member limit to `3000`
- **AND** the app MUST continue to enforce the separate 200-contact manual selection cap on the picker page
