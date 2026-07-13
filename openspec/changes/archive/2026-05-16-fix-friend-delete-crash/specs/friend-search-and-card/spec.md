## MODIFIED Requirements

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
