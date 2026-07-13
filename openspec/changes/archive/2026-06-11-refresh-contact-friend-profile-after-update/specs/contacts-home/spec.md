## MODIFIED Requirements

### Requirement: Friend Directory Rendering

The contacts home SHALL show the friend directory with visible display names, avatars, blacklist filtering, shortcut rows, alphabet navigation, and friend online status from the current subscription result, and SHALL not keep stale online state after disconnect/reconnect.

#### Scenario: Friend profile updates after viewing the friend card

- **GIVEN** a friend row is visible in the contacts friend directory
- **AND** that friend's latest cloud profile nickname or avatar has changed
- **WHEN** the user opens the friend card for that friend and then returns to the contacts tab
- **THEN** the friend row shows the latest nickname and avatar without requiring a pull-to-refresh
- **AND** if a friend remark name exists, the row continues to prefer the remark name over the profile nickname
