## MODIFIED Requirements

### Requirement: Team conversation removal after exit or dismissal

The conversation list SHALL remove team conversations after the current user leaves the team, leaves a discussion group, is removed from the team, or the team is dismissed. A removed team conversation MUST remain excluded while the current user is not a valid member, but MUST be restorable when the current user later rejoins the same valid team.

#### Scenario: Deleted conversation receives a new message

- **GIVEN** the user deletes a P2P or still-valid team conversation from the conversation list
- **WHEN** a new message for that conversation is received
- **THEN** RN MUST remove the ordinary local hidden marker for that conversation
- **AND** the conversation row MUST be allowed to appear again with the new latest-message preview
- **AND** RN MUST NOT restore conversations excluded because the team was dismissed, left, or otherwise invalid for the current user
