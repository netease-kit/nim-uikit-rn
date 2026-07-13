## MODIFIED Requirements

### Requirement: Friend Directory Rendering

The contacts home SHALL show the friend directory with visible display names, avatars, blacklist filtering, shortcut rows, alphabet navigation, and friend online status from the current subscription result, SHALL preserve the last known friend status while the current device is temporarily disconnected, and SHALL not keep stale online state after reconnect and status synchronization.

#### Scenario: Friend online status is visible

- **WHEN** the user opens the contacts friend list
- **THEN** RN MUST subscribe to visible friend account online status using the shared UIKit user-status source
- **AND** each friend row avatar MUST display the resolved online or offline status indicator
- **AND** status updates received while the list is mounted MUST update the row without requiring a page refresh
