## MODIFIED Requirements

### Requirement: Friend Directory Rendering

The contacts home SHALL show the friend directory with visible display names, avatars, blacklist filtering, shortcut rows, alphabet navigation, and friend online status from the current subscription result, SHALL preserve the last known friend status while the current device is temporarily disconnected, and SHALL not keep stale online state after reconnect and status synchronization.

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
