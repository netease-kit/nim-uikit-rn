## ADDED Requirements

### Requirement: Alert Toast Description-Only Formatting

Shared alert-toast feedback SHALL display only the descriptive message when both a title and description are supplied.

#### Scenario: Alert toast receives title and description

- **WHEN** RN or UIKit code calls shared alert toast with both a non-empty title and a non-empty description
- **THEN** the toast SHALL display only the description
- **AND** the toast SHALL NOT render the title as a separate line

#### Scenario: Alert toast receives only title

- **WHEN** RN or UIKit code calls shared alert toast with a non-empty title and no description
- **THEN** the toast SHALL display the title as the toast message
