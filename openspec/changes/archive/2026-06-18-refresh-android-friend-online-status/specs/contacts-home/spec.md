## MODIFIED Requirements

### Requirement: Friend Directory Rendering

The contacts home SHALL show the friend directory with visible display names, avatars, blacklist filtering, shortcut rows, alphabet navigation, and friend online status from the current subscription result, SHALL subscribe only the initial and currently visible friend rows for online-status push updates on Android, SHALL preserve the last known friend status while the current device is temporarily disconnected, and SHALL not keep stale online state after reconnect and status synchronization.

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
