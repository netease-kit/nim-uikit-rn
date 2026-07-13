## ADDED Requirements

### Requirement: IM Online State Fallback For Network Availability

IM operations that use the shared network precheck SHALL tolerate platform network reachability false negatives when the IM SDK is already online.

#### Scenario: iOS NetInfo reports offline while IM SDK is connected

- **GIVEN** the RN iOS client is logged in to IM
- **AND** the IM SDK connection status is connected
- **AND** `NetInfo.fetch()` reports `isConnected === false` or `isInternetReachable === false`
- **WHEN** the user performs an IM operation guarded by `ensureNetworkAvailable()`, such as deleting a friend
- **THEN** the network precheck MUST treat the network as available
- **AND** the operation MUST be allowed to call the IM SDK

#### Scenario: SDK is not connected

- **GIVEN** `NetInfo.fetch()` reports offline
- **AND** the IM SDK is not logged in or not connected
- **WHEN** an IM operation calls `ensureNetworkAvailable()`
- **THEN** RN MUST keep showing the current network-unavailable error
