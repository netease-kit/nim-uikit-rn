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

Conversation search SHALL support offline result navigation when the necessary local metadata is already available.

#### Scenario: Offline team search result opens chat with cached metadata

- **WHEN** the user is offline and opens a team result from conversation search
- **AND** the local conversation list does not yet contain that team conversation
- **THEN** RN MUST create or update a local placeholder conversation using the searched team name and avatar
- **AND** the chat detail header MUST show the team name instead of the team id

#### Scenario: Failed offline team message remains visible after reopening

- **WHEN** the user sends a message in an offline team chat opened from search
- **AND** that message is kept locally with a failed sending state
- **WHEN** the user reconnects and opens the same conversation from the home conversation list
- **THEN** the chat detail timeline MUST still show the locally failed message
- **AND** loading server history MUST NOT discard that local failed message

### Requirement: Search and picker pages use the unified back button visual

Conversation search and conversation picker pages SHALL align their back button visual with the shared navigation back button style.

#### Scenario: Opening conversation search

- **WHEN** the user opens the conversation search page
- **THEN** the header back button MUST use the shared iOS-style left arrow icon
- **AND** the button MUST NOT display blue highlight styling

#### Scenario: Opening conversation picker

- **WHEN** the user opens the conversation picker page
- **THEN** the header left action area MUST follow the shared back button visual rules when it is used as a back affordance
- **AND** custom left actions that are not a back affordance MAY keep their existing text treatment

### Requirement: Search Result Navigation Recovers After Return

Conversation search result rows SHALL be tappable after the user opens one result, returns from chat, and taps another result.

#### Scenario: Open another search result after returning from chat

- **GIVEN** the user searches for a keyword and sees matching search results
- **WHEN** the user opens one result, returns from the chat page to the search result page, and taps any valid result
- **THEN** the app MUST open the tapped chat page
- **AND** the result rows MUST NOT remain disabled by the previous navigation lock
