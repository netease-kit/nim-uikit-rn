## ADDED Requirements

### Requirement: Appearance Selection Page

The settings module SHALL provide an appearance-selection page reachable from settings and SHALL expose the theme options and current-selection indicator required by the tests.

#### Scenario: Opening appearance settings

- **WHEN** the user enters the appearance-selection page
- **THEN** the page shows the expected title, option rows, and selected-state presentation

### Requirement: Repeated Theme Switching

The appearance module SHALL support repeated switching between the supported themes without leaving the page in an inconsistent visual or persisted state.

#### Scenario: Switching appearance repeatedly

- **WHEN** the user changes appearance multiple times in one session
- **THEN** the latest confirmed selection becomes the only active and persisted appearance value

### Requirement: Persisted Appearance Restore

The app SHALL persist the selected appearance and restore it after process restart or next launch.

#### Scenario: Restoring appearance after relaunch

- **WHEN** the user restarts the app after changing appearance
- **THEN** the previously selected appearance is restored on launch
