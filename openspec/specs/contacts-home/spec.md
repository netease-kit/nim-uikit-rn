# contacts-home Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Contacts Home Structure

The contacts home screen SHALL render user-facing copy in the active in-app language.

#### Scenario: English contacts home copy

- **GIVEN** the active in-app language is English
- **WHEN** the user opens the contacts home screen
- **THEN** shortcut labels, summary text, empty states, and headers SHALL be shown in English

### Requirement: Friend Directory Rendering

The contacts home SHALL show the friend directory with visible display names, avatars, blacklist filtering, shortcut rows, alphabet navigation, and friend online status from the current subscription result, SHALL subscribe only the initial and currently visible friend rows for online-status push updates on Android, SHALL preserve the last known friend status while the current device is temporarily disconnected, and SHALL not keep stale online state after reconnect and status synchronization.

#### Scenario: Friend online status is visible

- **WHEN** the user opens the contacts friend list
- **THEN** RN MUST subscribe to visible friend account online status using the shared UIKit user-status source
- **AND** each friend row avatar MUST display the resolved online or offline status indicator
- **AND** status updates received while the list is mounted MUST update the row without requiring a page refresh

#### Scenario: Friend goes offline while current device is disconnected

- **GIVEN** the friend list shows friend A as online
- **WHEN** the current device disconnects from the network
- **AND** friend A goes offline before the current device reconnects
- **THEN** while the current device remains disconnected RN MUST keep showing friend A's last known online/offline status instead of forcing a local offline fallback
- **AND** after reconnect and status synchronization RN MUST show friend A as offline

#### Scenario: Friend status stays offline through temporary disconnection

- **GIVEN** the friend list shows friend A as offline before the current device disconnects
- **WHEN** the current device disconnects from the network
- **THEN** RN MUST keep showing friend A as offline during the disconnected period
- **AND** RN MUST NOT rewrite that cached state merely because the current device lost connectivity

#### Scenario: Friend profile updates after viewing the friend card

- **GIVEN** a friend row is visible in the contacts friend directory
- **AND** that friend's latest cloud profile nickname or avatar has changed
- **WHEN** the user opens the friend card for that friend and then returns to the contacts tab
- **THEN** the friend row shows the latest nickname and avatar without requiring a pull-to-refresh
- **AND** if a friend remark name exists, the row continues to prefer the remark name over the profile nickname
- **AND** the row MUST NOT keep using a stale friend-profile avatar value when shared UIKit user data already has a newer avatar

#### Scenario: Android friend status updates contacts

- **GIVEN** the contacts friend list runs on Android
- **AND** the initial friend rows or currently visible friend rows are subscribed through the shared UIKit user-status source
- **WHEN** a friend logs in or logs out
- **THEN** the friend row avatar online indicator MUST update from the received user-status change without requiring a manual refresh

#### Scenario: Android contacts avoid full friend-directory status subscription

- **GIVEN** the contacts friend list runs on Android
- **AND** the logged-in account has a large friend directory
- **WHEN** the contacts home opens
- **THEN** the page MUST NOT subscribe the entire friend directory for online-status push updates at once

### Requirement: Contacts Navigation

The contacts home page SHALL navigate correctly from each shortcut or row into friend card, verification center, blacklist, joined-team list, AI-user list, add-friend flow, and individual friend chat surfaces.

#### Scenario: Opening a contact surface from Contacts

- **WHEN** the user taps a supported shortcut or friend row
- **THEN** the app routes into the corresponding page or conversation with the expected initial state

#### Scenario: Opening a shortcut target without freezing

- **WHEN** the user taps the verification center, blacklist, joined-team, or my-AI-user shortcut from the Contacts tab
- **THEN** the app completes the navigation into the corresponding target page
- **AND** the current UI does not remain stuck in a pressed or non-interactive state

#### Scenario: Opening my AI users

- **WHEN** the user taps `我的数字人`
- **THEN** the app opens a page listing AI users returned by the UIKit AI user store
- **AND** tapping an AI user opens or creates the corresponding p2p conversation
