# conversation-search-and-picker Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: Conversation Search

The app SHALL provide a search page for conversations, friends, and teams with placeholder, clear-input behavior, matching rules, no-result state, and result navigation required by the tests.

#### Scenario: Searching from conversation entry

- **WHEN** the user enters search text on the conversation search page
- **THEN** the app shows matched conversations, friends, and teams or the expected no-result state

#### Scenario: Clearing search content

- **WHEN** the user deletes all search text with the clear affordance
- **THEN** the search field and result panel reset to the expected initial state

### Requirement: Search Result Validity

The search page SHALL follow the workbook's result-matching rules and SHALL remove or invalidate stale results for teams that were dismissed or for memberships that were revoked before navigation.

#### Scenario: Opening a stale search result

- **WHEN** a team result becomes invalid after search but before the user taps it
- **THEN** the app prevents broken navigation and surfaces the expected fallback state

### Requirement: People Picker

The app SHALL provide a people-picker flow for friends and digital-human accounts, with selected-state rendering, duplicate prevention, friend-empty state, and max-count handling.

#### Scenario: Selecting people for a follow-up flow

- **WHEN** the user selects or unselects friends or digital-human accounts
- **THEN** the picker updates selection state and enforces the selection rules defined by the tests

#### Scenario: Reviewing picker content

- **WHEN** the picker opens with no friends or with mixed friend and digital-human data
- **THEN** the page shows the expected row layout, button copy, and empty-state treatment

### Requirement: Offline Search Handling

The app SHALL keep search and picker flows stable when the network is unavailable and SHALL surface the required failure state instead of breaking navigation.

#### Scenario: Searching while offline

- **WHEN** the user performs a search that needs refreshed data without network connectivity
- **THEN** the app remains on the search page and shows the expected failure feedback

