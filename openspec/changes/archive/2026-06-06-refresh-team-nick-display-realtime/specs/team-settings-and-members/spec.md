## MODIFIED Requirements

### Requirement: Team Member List And Avatar Navigation

The team-setting and team-member pages SHALL render member rows with nickname precedence, role labels, avatar display, avatar-tap navigation, search, large-team rendering behavior, and initial-load failure recovery required by the tests.

#### Scenario: Team nickname updates member rows in realtime

- **WHEN** a member's nickname in the current team is changed
- **THEN** the team settings member preview and full member list update to show the new team nickname without requiring page re-entry
- **AND** the displayed member name uses team nickname before friend alias, profile nickname, and account ID
