## ADDED Requirements

### Requirement: Team And AI List Row Density

The RN "My Teams" and "My AI Users" pages SHALL use tighter row spacing closer to the conversation list baseline.

#### Scenario: Team and AI rows render with tighter spacing

- **GIVEN** the user opens the team list or AI-user list page
- **WHEN** a list row is rendered
- **THEN** the row height and internal spacing MUST be tighter than the previous implementation
