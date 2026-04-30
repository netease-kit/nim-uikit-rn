# friend-search-and-card Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: Add-Friend Search Flow

The app SHALL provide exact-match account search with input focus, keyboard, clear-action, and result-state behavior aligned with the contact test cases.

#### Scenario: Searching by account

- **WHEN** the user searches for self, an existing friend, a stranger, or a non-existent account
- **THEN** the search result state reflects the correct relationship case

### Requirement: Stranger Card State

The app SHALL show a card page for the searched account that distinguishes self, friend, stranger, blacklisted-user, and non-existent-account states.

#### Scenario: Viewing a stranger card

- **WHEN** the user opens the card for a searched account
- **THEN** the page shows the correct action set and relationship state for that account

### Requirement: Friend Card And Remark Entry

The app SHALL provide a friend card for existing friends with chat entry, remark entry, blacklist toggle, and delete-friend actions required by the tests.

#### Scenario: Viewing an existing friend card

- **WHEN** the user opens the card for an existing friend
- **THEN** the page shows the expected relationship actions and friend metadata layout

### Requirement: Friend Remark Editing

The app SHALL provide remark editing with clear action, length limits, supported character handling, blank-input handling, save, cancel, and cross-surface refresh behavior required by the tests.

#### Scenario: Saving a friend remark

- **WHEN** the user creates, edits, deletes, or cancels a friend remark
- **THEN** the remark editor and all dependent surfaces follow the test-defined persistence and display rules

### Requirement: Add-Friend Submission

The app SHALL support sending a friend request from the card page and SHALL surface offline, reconnect, and network-switch outcomes according to the tests.

#### Scenario: Sending a friend application

- **WHEN** the user submits a friend request from the card page
- **THEN** the app sends the request and updates the card state or failure state accordingly

### Requirement: Relationship Mutation Handling

The friend-card flow SHALL handle delete-friend, blacklist-related, and reconnect outcomes without leaving stale relationship state in search, card, verification, or chat surfaces.

#### Scenario: Deleting a friend from the card flow

- **WHEN** the user confirms or cancels delete-friend from the card page
- **THEN** the resulting relationship state and follow-up surfaces match the workbook rules

