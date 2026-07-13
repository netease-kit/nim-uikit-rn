## MODIFIED Requirements

### Requirement: Relationship Mutation Handling

The friend-card flow SHALL handle delete-friend, blacklist-related, and reconnect outcomes without leaving stale relationship state in search, card, verification, or chat surfaces.

#### Scenario: Deleting a friend from the card flow

- **WHEN** the user taps delete-friend from an existing friend's card
- **THEN** the app shows a confirmation dialog that identifies the contact being deleted
- **WHEN** the user cancels that dialog
- **THEN** the user remains on the friend card
- **WHEN** the user confirms deletion while the network is available
- **THEN** the friend relation is removed, the friend list refreshes, and the app returns to the contacts friend list

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

### Requirement: Friend Remark Editing

The app SHALL provide remark editing with clear action, length limits, supported character handling, blank-input handling, save, cancel, and cross-surface refresh behavior required by the tests.

#### Scenario: Saving a friend remark while offline

- **WHEN** the user saves a friend remark while the network is unavailable
- **THEN** the app does not call the remark mutation
- **AND** the app shows the standard network-unavailable message

#### Scenario: Retrying friend remark save after reconnect

- **WHEN** the network is restored or switched to an available connection
- **THEN** saving the friend remark updates the relationship state and returns to the friend card
