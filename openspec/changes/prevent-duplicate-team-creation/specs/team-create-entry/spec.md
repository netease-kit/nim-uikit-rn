## MODIFIED Requirements

### Requirement: Team Creation Limits And Throttling

The team-creation flow SHALL enforce empty-selection checks, repeated-create throttling, per-create invite limits, and the overall member-cap rules required by the tests.

#### Scenario: Creating with invalid selection

- **WHEN** the user attempts to create a team with empty or over-limit selection
- **THEN** the app blocks creation and shows the expected validation state

#### Scenario: Creating with repeated taps

- **WHEN** the user taps the create action multiple times before the first request settles
- **THEN** the app prevents duplicate team creation and keeps one authoritative result
- **AND** the flow MUST create at most one new team until the in-flight create request resolves
