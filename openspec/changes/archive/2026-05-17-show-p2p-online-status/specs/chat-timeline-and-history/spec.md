## MODIFIED Requirements

### Requirement: Chat Header And Timeline Identity

The chat detail page SHALL render a usable timeline, composer, header actions, conversation metadata, and p2p peer online status where applicable.

#### Scenario: P2P chat peer status updates

- **WHEN** the user opens a one-to-one chat page
- **THEN** the app subscribes to the peer's user status
- **AND** the header shows `在线` when the peer status is online
- **AND** the header shows `离线` when the peer status is offline or unknown
