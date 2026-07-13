## MODIFIED Requirements

### Requirement: RN Online Status Uses Subscription Events

The RN UIKit online/offline status display SHALL update from SDK user-status subscription events and current subscription results, SHALL NOT infer online state from message receipt or message receive activity, and SHALL not keep stale online state after disconnect/reconnect.

#### Scenario: P2P chat peer goes offline while current device is disconnected

- **GIVEN** the current user is viewing a P2P chat page
- **AND** the peer is shown as online
- **WHEN** the current device disconnects from the network
- **AND** the peer goes offline before the current device reconnects
- **THEN** after reconnect and status synchronization RN MUST show the peer as offline
- **AND** RN MUST NOT continue displaying the stale pre-disconnect online state
