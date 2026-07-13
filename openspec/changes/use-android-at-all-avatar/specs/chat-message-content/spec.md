## ADDED Requirements

### Requirement: At-All Candidate Uses Android Avatar

The chat page mention selector SHALL render the `所有人` or at-all candidate with the same 42dp blue circular double-person avatar visual used by the Android default reference implementation.

#### Scenario: At-all candidate is visible

- **WHEN** the user types `@` in a team chat and the mention selector includes the at-all candidate
- **THEN** the at-all candidate avatar MUST use the Android `ic_team_all` visual
- **AND** it MUST render as a blue circle rather than the green rounded-square fun-style avatar
