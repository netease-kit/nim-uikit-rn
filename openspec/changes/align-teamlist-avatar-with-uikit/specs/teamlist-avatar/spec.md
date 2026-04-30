## ADDED Requirements

### Requirement: Team list uses UIKit team avatar rendering

The `/contacts/teamlist` page MUST render each team avatar using the shared UIKit avatar component instead of a hard-coded icon placeholder.

#### Scenario: Team has an uploaded avatar

- **WHEN** a team in the list has a stored avatar
- **THEN** the row shows that avatar image
- **AND** the row does not render the fixed circular icon placeholder

#### Scenario: Team has no uploaded avatar

- **WHEN** a team in the list does not have a stored avatar
- **THEN** the row uses the UIKit fallback avatar style for that team
- **AND** the fallback appearance matches the shared avatar behavior used elsewhere in the app
