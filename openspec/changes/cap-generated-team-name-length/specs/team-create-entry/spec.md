## MODIFIED Requirements

### Requirement: Team Creation Limits And Throttling

The team-creation flow SHALL enforce empty-selection checks, repeated-create throttling, per-create invite limits, the overall member-cap rules required by the tests, and the default generated team-name length limit.

#### Scenario: Creating with invalid selection

- **WHEN** the user attempts to create a team with empty or over-limit selection
- **THEN** the app blocks creation and shows the expected validation state

#### Scenario: Creating with repeated taps

- **WHEN** the user taps the create action multiple times before the first request settles
- **THEN** the app prevents duplicate team creation and keeps one authoritative result

#### Scenario: Generated default team name stays within the team-name limit

- **WHEN** the app builds a default team name from the current user and selected invitee display names
- **THEN** the generated name MUST NOT exceed `30` characters in total
