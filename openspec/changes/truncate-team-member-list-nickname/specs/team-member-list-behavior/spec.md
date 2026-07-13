## MODIFIED Requirements

### Requirement: Team Member Row Text Layout

The team member list SHALL render each member row with avatar, display name, account and role information.

#### Scenario: Long member nickname is truncated

- **GIVEN** a team member has a long display name
- **WHEN** the member row is rendered in the team member list
- **THEN** the display name is shown on at most one line
- **AND** overflowing text is truncated with an ellipsis
