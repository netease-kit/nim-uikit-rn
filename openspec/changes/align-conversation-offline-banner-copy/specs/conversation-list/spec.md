## MODIFIED Requirements

### Requirement: Conversation List Offline Banner

The app SHALL show a clear offline banner on the conversation list when the device loses network connectivity.

#### Scenario: Offline banner copy

- **WHEN** the user opens the conversation list while the device has no network connection
- **THEN** the app MUST display the message `当前网络未连接，请检查你的网络设置`
- **AND** the banner MUST disappear again after network connectivity is restored
