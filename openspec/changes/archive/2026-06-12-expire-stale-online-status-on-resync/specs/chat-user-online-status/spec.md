## MODIFIED Requirements

### Requirement: RN Online Status Uses Subscription Events

The RN UIKit online/offline status display SHALL update from SDK user-status subscription events and current subscription results, SHALL NOT infer online state from message receipt or message receive activity, SHALL preserve the last known status while the current device is temporarily disconnected, and SHALL converge to the latest status after reconnect and status synchronization. After reconnect, a previously online peer status that is not confirmed by the new subscription/current-status cycle SHALL no longer render as online.

#### Scenario: P2P chat peer goes offline while current device is disconnected

- **GIVEN** the current user is viewing a P2P chat page
- **AND** the peer is shown as online
- **WHEN** the current device disconnects from the network
- **AND** the peer goes offline before the current device reconnects
- **THEN** while the current device remains disconnected RN MUST continue showing the peer's last known online/offline status instead of forcing a local offline fallback
- **AND** after reconnect and status synchronization RN MUST show the peer as offline

#### Scenario: P2P chat peer status remains known offline during current device disconnection

- **GIVEN** the current user is viewing a P2P chat page
- **AND** the peer is shown as offline before the current device disconnects
- **WHEN** the current device disconnects from the network
- **THEN** RN MUST keep showing the peer as offline during the disconnected period
- **AND** RN MUST NOT rewrite that cached state merely because the current device lost connectivity
