## MODIFIED Requirements

### Requirement: Friend Directory Rendering

The contacts home SHALL show the friend directory with visible display names, avatars, blacklist filtering, shortcut rows, alphabet navigation, and friend online status from the current subscription result, and SHALL not keep stale online state after disconnect/reconnect.

#### Scenario: Friend goes offline while current device is disconnected

- **GIVEN** the friend list shows friend A as online
- **WHEN** the current device disconnects from the network
- **AND** friend A goes offline before the current device reconnects
- **THEN** after reconnect and status synchronization RN MUST show friend A as offline
- **AND** RN MUST NOT continue displaying the stale pre-disconnect online state
