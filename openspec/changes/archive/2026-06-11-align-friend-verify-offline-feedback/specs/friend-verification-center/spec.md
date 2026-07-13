## ADDED Requirements

### Requirement: Offline Verification Action Feedback

The verification center SHALL show the localized network-unavailable message for inbound agree or reject actions attempted while the device is offline, and SHALL NOT expose raw SDK `illegal state` text to the user.

#### Scenario: Agreeing while offline

- **GIVEN** the device is offline and the verification center shows an inbound pending friend application
- **WHEN** the user taps agree
- **THEN** the app shows the localized network-unavailable message
- **AND** the verification record remains pending
- **AND** the user does not see raw SDK `illegal state` text

#### Scenario: Rejecting while offline

- **GIVEN** the device is offline and the verification center shows an inbound pending friend application
- **WHEN** the user taps reject
- **THEN** the app shows the localized network-unavailable message
- **AND** the verification record remains pending
- **AND** the user does not see raw SDK `illegal state` text

### Requirement: Local-First Verification Clear

The verification center SHALL clear the currently visible verification records without requiring network connectivity, SHALL provide success feedback after the local clear completes, and SHALL keep cleared historical records hidden on later refreshes until newer verification records arrive.

#### Scenario: Clearing verification messages while offline

- **GIVEN** the verification center shows one or more verification records and the device is offline
- **WHEN** the user taps clear
- **THEN** the visible verification list is cleared immediately
- **AND** the app shows success feedback for the clear action
- **AND** the operation does not fail only because the network is unavailable

#### Scenario: Refreshing after a local clear

- **GIVEN** the user has already cleared the visible verification records
- **WHEN** the app later refreshes friend verification history
- **THEN** verification records at or before the clear point remain hidden
- **AND** only newer verification records can appear again
