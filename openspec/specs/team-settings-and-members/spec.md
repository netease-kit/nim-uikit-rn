# team-settings-and-members Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
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

### Requirement: Team Member List And Avatar Navigation

The team-setting and team-member pages SHALL render member rows with nickname precedence, role labels, avatar display, avatar-tap navigation, search, large-team rendering behavior, and initial-load failure recovery required by the tests.

#### Scenario: Viewing team members

- **WHEN** the user opens a team member list
- **THEN** member rows display the expected nickname precedence and role state

#### Scenario: Searching or browsing large member lists

- **WHEN** the team has many members or the user searches within the member list
- **THEN** the page follows the workbook rules for result filtering, ordering, and full-member visibility

#### Scenario: Loading team members fails on entry

- **WHEN** the member list or add-member picker cannot finish loading its initial team-member data
- **THEN** the page shows a failure state distinct from an empty list and provides a retry action

### Requirement: Team Membership Changes

The team-setting pages SHALL refresh when members join, leave, or are removed, and SHALL distinguish the real-time update behavior required by advanced-team versus discussion-group test cases.

#### Scenario: Syncing team membership changes

- **WHEN** the team membership changes while the page is open
- **THEN** the visible member list and available actions update to the latest valid state

### Requirement: Team Governance And Exit Operations

The team-setting flow SHALL support add-member, leave, dismiss, kick, role-based remove-member operations, and their confirm, limit, offline, and cross-endpoint behaviors required by the tests.

#### Scenario: Leaving, dismissing, or removing members

- **WHEN** the user performs a permitted membership mutation from team settings or member list
- **THEN** the resulting team state, navigation, and confirmation behavior follow the workbook rules

### Requirement: Team-Wide Mute And Permission Changes

The team-setting flow SHALL support team-wide mute defaults, mute toggling, composer-state reactions, and role-permission changes that may happen mid-operation.

#### Scenario: Team permission changes while operating

- **WHEN** mute state or management permission changes while the user is composing or managing members
- **THEN** the setting page and chat composer converge to the latest permitted behavior

