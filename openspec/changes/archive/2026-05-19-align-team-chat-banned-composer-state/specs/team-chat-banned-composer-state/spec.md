## ADDED Requirements

### Requirement: Team chat banned composer shows disabled visual state

The chat detail composer SHALL display a disabled visual state when the current team conversation is muted for the user.

#### Scenario: Opening a muted team conversation

- **WHEN** the user opens a team conversation where the composer is not editable because the team is muted
- **THEN** the composer input container MUST use a disabled visual treatment
- **AND** the placeholder text MUST also use a disabled tone that matches the non-editable state
