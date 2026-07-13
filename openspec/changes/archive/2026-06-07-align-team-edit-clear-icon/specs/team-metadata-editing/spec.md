## MODIFIED Requirements

### Requirement: Team Name And Introduction Editing

The app SHALL provide editors for team name and team introduction with page UI, character counters, length limits, whitespace handling, clear-icon alignment, and save behavior aligned with the tests.

#### Scenario: Editing team name or introduction

- **WHEN** the user edits and saves the team name or introduction
- **THEN** the app validates the input and updates team metadata on success

#### Scenario: Aligning clear icon with first-line text

- **GIVEN** the team name or team introduction edit page has non-empty input
- **WHEN** the clear icon is visible in the multiline input card
- **THEN** the clear icon SHALL align vertically with the first line of text
- **AND** tapping the clear icon SHALL keep clearing the current input value
