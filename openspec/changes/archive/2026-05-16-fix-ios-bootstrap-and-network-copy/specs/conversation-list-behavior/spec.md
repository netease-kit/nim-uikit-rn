## MODIFIED Requirements

### Requirement: Offline Banner Accuracy

The conversation list SHALL show an offline warning only when network connectivity is confirmed unavailable.

#### Scenario: iOS reports transient unknown reachability

- **GIVEN** the device network is connected
- **AND** the platform has not yet resolved `isInternetReachable`
- **WHEN** the conversation list renders
- **THEN** the app does not show the offline warning banner

#### Scenario: Network is confirmed unavailable

- **GIVEN** the device is disconnected or the platform explicitly reports internet reachability unavailable
- **WHEN** the conversation list renders
- **THEN** the app shows the shared offline warning copy
