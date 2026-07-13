## MODIFIED Requirements

### Requirement: Team Setting Page Layout

The app SHALL provide team-setting pages with team metadata, member list, add-member entry, history or more-actions entry, reminder toggle, stick-top toggle, group-id display, and role-based management actions, while limiting team-wide mute controls to the owner role when the workbook requires that restriction.

#### Scenario: Opening team settings

- **WHEN** the user opens team settings from a team conversation
- **THEN** the page shows the required team-setting sections for the current role and team state

#### Scenario: Team settings initial load fails

- **WHEN** the team-setting page cannot load the initial team profile or member summary
- **THEN** the page shows a dedicated failure state with retry instead of treating the team as empty

#### Scenario: Opening team history

- **WHEN** the user taps the history entry from team settings
- **THEN** the app opens the history-record page for the current team conversation

#### Scenario: Team name row truncates long values

- **WHEN** the team settings page shows a long team name in the team-name configuration row
- **THEN** the value remains on a single line
- **AND** overflow text is truncated with an ellipsis

#### Scenario: Team name row opens direct editing

- **WHEN** the user taps the team-name configuration row from team settings
- **THEN** the app opens the team-name edit page directly
- **AND** the flow MUST NOT require entering the team-info page first
