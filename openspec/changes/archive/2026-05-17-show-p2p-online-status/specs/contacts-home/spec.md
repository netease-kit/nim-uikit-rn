## MODIFIED Requirements

### Requirement: Friend Directory Rendering

The contacts home SHALL show the friend directory with visible display names, avatars, blacklist filtering, shortcut rows, alphabet navigation, and friend online status.

#### Scenario: Friend online status updates

- **WHEN** a friend row is visible in the contacts list
- **THEN** the app subscribes to that friend's user status
- **AND** the row shows `在线` when the friend status is online
- **AND** the row shows `离线` when the friend status is offline or unknown
