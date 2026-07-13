## ADDED Requirements

### Requirement: RN Online Status Uses Subscription Events

The RN UIKit online/offline status display SHALL update from SDK user-status subscription events and SHALL NOT infer online state from message receipt or message receive activity.

#### Scenario: Subscribed peer status changes

- **WHEN** the RN SDK receives a subscribed online-status event for a P2P peer
- **THEN** the conversation list, contacts list, and chat detail online-status display MUST update from that event
- **AND** message receive or read-receipt events MUST NOT be used as a substitute for online-status events
