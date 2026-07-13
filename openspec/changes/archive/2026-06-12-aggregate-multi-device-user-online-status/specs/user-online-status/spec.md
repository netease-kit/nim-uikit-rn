## ADDED Requirements

### Requirement: Multi-device account online status must be aggregated

The RN app MUST determine a user's online/offline state by aggregating subscribed status events across that user's active client devices.

#### Scenario: One device goes offline while another remains online

- **GIVEN** account A is logged in on multiple devices
- **AND** account B has subscribed to account A's online status
- **WHEN** one of account A's devices goes offline
- **AND** at least one other device for account A remains in login state
- **THEN** account B still sees account A as online

#### Scenario: All devices go offline

- **GIVEN** account B has subscribed to account A's online status
- **WHEN** all tracked devices for account A report non-login status
- **THEN** account B sees account A as offline

#### Scenario: Newly subscribed friend status has not synced yet

- **GIVEN** account A is online
- **AND** account B and account C are logged in on Android and iOS with the same account
- **WHEN** either device adds account A as a friend and the P2P conversation appears on both devices
- **AND** the Android-side subscription call succeeds but does not immediately return account A's status
- **THEN** RN MUST NOT write a synthetic offline status for account A
- **AND** RN MUST update account A to online when the subscription event or current-status result arrives

#### Scenario: Android RN status events use string client types

- **GIVEN** account A is online on iOS
- **AND** account A also has an Android client that reports a later non-login status
- **WHEN** RN receives status events whose `clientType` is the string `iOS` or `Android`
- **THEN** RN MUST aggregate those events as distinct client devices
- **AND** RN MUST still show account A as online while the iOS client remains in login state

#### Scenario: Android RN offline event has no client type

- **GIVEN** account A has a tracked login status on one client
- **WHEN** RN receives a non-login status event for account A without a parseable `clientType`
- **THEN** RN MUST NOT let that unknown-terminal event overwrite the tracked online client state

#### Scenario: Android has no synced status for a newly visible friend

- **GIVEN** account A is online
- **AND** account B's Android RN client subscribes to account A's online status through the legacy event fallback
- **WHEN** the subscription succeeds but Android has not received account A's current status yet
- **THEN** RN MUST treat account A's status as unknown instead of offline
- **AND** RN MUST NOT use the single-record im-store subscription cache to render account A offline
- **AND** RN MUST still render the P2P online indicator with the offline fallback while the status is unknown
- **AND** RN MUST retry current-status sync with a fast unsubscribe/resubscribe attempt and delayed follow-up retries if account A is still unknown

#### Scenario: Android fallback listener is rebound during conversation updates

- **GIVEN** Android RN uses the legacy pushEvents fallback because the RN SDK has no complete V2 subscription service
- **AND** RN has already received a user-status event for account A
- **WHEN** the conversation list recomputes visible P2P account ids and asks to bind the same NIM source again
- **THEN** RN MUST keep the existing fallback listener, subscription cache, and aggregated account A status
- **AND** RN MUST NOT clear the status cache solely because the real V2 service object was unavailable
