# user-online-status Specification

## Purpose

TBD - created by archiving change aggregate-multi-device-user-online-status. Update Purpose after archive.

## Requirements

### Requirement: Multi-device account online status must be aggregated

The RN app MUST determine a user's online/offline state by aggregating subscribed status events across that user's active client devices. The RN app MUST NOT keep rendering an online state from a previous connection or login session after the current connection has resubscribed and failed to confirm that the account is still online.

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

#### Scenario: Non-login event includes server online config for the same client

- **GIVEN** account A has an iOS client whose latest user-status event is non-login
- **AND** that event includes `serverConfig.online` containing the same iOS client type
- **WHEN** RN aggregates account A's user-status events
- **THEN** RN MUST treat the event status type as authoritative for that client
- **AND** RN MUST NOT convert that same non-login client event into an online state from `serverConfig.online`
- **AND** RN MUST render account A offline when no other client remains online

#### Scenario: Android RN offline event has no client type

- **GIVEN** account A has a tracked login status on one client
- **WHEN** RN receives a non-login status event for account A without a parseable `clientType`
- **THEN** RN MUST NOT let that unknown-terminal event overwrite the tracked online client state

#### Scenario: Android current-status offline result has no client type

- **GIVEN** account A is cached as online in RN
- **AND** account B's Android RN client resubscribes to account A's user status
- **WHEN** the subscription immediate result or current-status query returns account A as non-login without a parseable `clientType`
- **THEN** RN MUST treat that result as authoritative for the current subscription cycle
- **AND** RN MUST clear account A's stale online client state
- **AND** RN MUST render account A as offline

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

#### Scenario: Reconnect does not confirm previously online friend

- **GIVEN** account B previously saw friend account A as online
- **AND** account B's RN client disconnects from the IM SDK
- **AND** account A goes offline before account B reconnects
- **WHEN** account B reconnects and RN resubscribes to account A's online status
- **AND** the current reconnect cycle does not return or push any online status for account A
- **THEN** RN MUST stop rendering the stale online status for account A
- **AND** RN MUST render account A with the offline fallback until a later online status is received

#### Scenario: Logout clears previous status cache

- **GIVEN** account B previously saw friend account A as online
- **WHEN** account B logs out, kills the process, or starts a new login session
- **THEN** RN MUST NOT reuse account A's previous online cache for the new session
- **AND** RN MUST render account A as offline or unknown until the new session receives current status evidence

#### Scenario: Process restart resubscribes visible friends

- **GIVEN** account B previously subscribed to friend account A
- **AND** account B kills the Android RN process
- **AND** account A is offline
- **WHEN** account B starts the RN app again and the conversation list subscribes to visible P2P accounts
- **THEN** RN MUST cancel the previous user-status subscription for account A before subscribing again
- **AND** RN MUST request immediate current-status synchronization for account A
- **AND** RN MUST NOT render account A as online from a stale subscription event or cached SDK result
