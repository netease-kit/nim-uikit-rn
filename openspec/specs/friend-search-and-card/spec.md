# friend-search-and-card Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Add-Friend Search Flow

The app SHALL provide exact-match account search with input focus, keyboard, clear-action, direct card navigation, and result-state behavior aligned with the contact test cases.

#### Scenario: Searching by account

- **WHEN** the user searches for self, an existing friend, a stranger, or a non-existent account
- **THEN** the search result state reflects the correct relationship case

#### Scenario: Exact account search opens the card

- **WHEN** the user enters a complete existing account in the add-friend search input
- **THEN** the app opens that account's card page

#### Scenario: Partial account search is treated as not found

- **WHEN** the user enters a partial account that is not itself a complete account
- **THEN** the app shows the user-not-found state and does not open a card

### Requirement: Stranger Card State

The app SHALL show a card page for the searched account that distinguishes self, friend, stranger, blacklisted-user, and non-existent-account states, and it MUST keep stranger actions limited to the controls required for stranger handling.

#### Scenario: Viewing a stranger card

- **WHEN** the user opens the card for a searched account
- **THEN** the page shows the correct action set and relationship state for that account

#### Scenario: Stranger card hides blacklist

- **WHEN** the user opens a stranger card
- **THEN** the page must not show the blacklist switch
- **AND** it must keep only the actions required for stranger handling such as add friend

#### Scenario: Stranger profile page stays minimal

- **WHEN** RN opens a non-friend, non-self, non-AI profile page
- **THEN** the page does not show a page-title label such as `陌生人名片`
- **AND** the page does not show the alias row
- **AND** the page does not show the blacklist switch

### Requirement: Friend Card And Remark Entry

The app SHALL provide a friend card for existing friends with chat entry, remark entry, blacklist toggle, and delete-friend actions required by the tests, and it MUST NOT duplicate the message notification switch that belongs to p2p session settings.

#### Scenario: Viewing an existing friend card

- **WHEN** the user opens the card for an existing friend
- **THEN** the page shows the expected relationship actions and friend metadata layout

#### Scenario: Friend card keeps blacklist but not message notification

- **WHEN** the user opens a friend card for an existing friend
- **THEN** the page may show the blacklist switch and friend actions such as chat and delete
- **AND** it must not show the message notification switch

### Requirement: Friend Remark Editing

The app SHALL provide remark editing with clear action, length limits, supported character handling, blank-input handling, save, cancel, and cross-surface refresh behavior required by the tests.

#### Scenario: Saving a friend remark while offline

- **WHEN** the user saves a friend remark while the network is unavailable
- **THEN** the app does not call the remark mutation
- **AND** the app shows the standard network-unavailable message

#### Scenario: Retrying friend remark save after reconnect

- **WHEN** the network is restored or switched to an available connection
- **THEN** saving the friend remark updates the relationship state and returns to the friend card

### Requirement: Add-Friend Submission

The app SHALL support sending a friend request from the card page and SHALL surface offline, reconnect, and network-switch outcomes according to the tests.

#### Scenario: Sending a friend application

- **WHEN** the user submits a friend request from the card page
- **THEN** the app sends the request and updates the card state or failure state accordingly

### Requirement: Relationship Mutation Handling

The friend-card flow SHALL handle delete-friend, blacklist-related, and reconnect outcomes without leaving stale relationship state in search, card, verification, or chat surfaces.

#### Scenario: Deleting a friend from the card flow

- **WHEN** the user taps delete-friend from an existing friend's card
- **THEN** the app shows a confirmation dialog that identifies the contact being deleted
- **WHEN** the user cancels that dialog
- **THEN** the user remains on the friend card
- **WHEN** the user confirms deletion while the network is available
- **THEN** the app enters a stable non-interactive transition state for the current card
- **AND** the friend relation is removed
- **AND** the friend list refreshes
- **AND** the app returns to the contacts friend list without crashing

#### Scenario: Deleting a friend while offline

- **WHEN** the user confirms delete-friend while the network is unavailable
- **THEN** the app does not call the relationship mutation
- **AND** the app shows the standard network-unavailable message

#### Scenario: Toggling blacklist from the friend card while offline

- **WHEN** the user toggles blacklist state from the friend card while the network is unavailable
- **THEN** the app does not call the blacklist mutation
- **AND** the app shows the standard network-unavailable message

#### Scenario: Retrying relationship mutations after reconnect

- **WHEN** the network is restored or switched to an available connection
- **THEN** delete-friend and blacklist actions may be retried and refresh the relationship state after success
