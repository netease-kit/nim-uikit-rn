## ADDED Requirements

### Requirement: List Identity Size Consistency

List-style pages that render avatar-and-name rows SHALL align avatar and nickname sizing with the conversation list baseline.

#### Scenario: Contact-style rows match conversation list sizing

- **GIVEN** the user opens a list-style page that shows avatar-and-name rows
- **WHEN** the row is rendered
- **THEN** the avatar size MUST match the conversation list avatar size
- **AND** the nickname font size MUST match the conversation list nickname size
