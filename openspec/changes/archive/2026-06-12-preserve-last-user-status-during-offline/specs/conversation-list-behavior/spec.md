## MODIFIED Requirements

### Requirement: Conversation List Layout And Empty State

The conversation list SHALL render conversation rows with identity, unread state, mute/stick-top indicators, preview text, timestamps, and p2p online status where applicable.

#### Scenario: P2P conversation status updates

- **WHEN** a one-to-one conversation row is visible
- **THEN** the app subscribes to that peer's user status
- **AND** the row shows `在线` when the peer status is online
- **AND** the row shows `离线` when the peer status is offline or unknown

#### Scenario: P2P conversation keeps last known status while current device is disconnected

- **GIVEN** a one-to-one conversation row is visible
- **AND** the row already shows that peer's latest known online or offline status
- **WHEN** the current device disconnects from the network
- **THEN** the row MUST keep showing that last known status during the disconnected period
- **AND** RN MUST NOT force the row to display `离线` solely because the current device is offline

#### Scenario: P2P conversation refreshes to latest status after reconnect

- **GIVEN** a one-to-one conversation row was visible before the current device disconnected
- **AND** the peer's status changed while the current device was offline
- **WHEN** the current device reconnects and user-status synchronization completes
- **THEN** the row MUST refresh to the peer's latest current status
- **AND** it MUST NOT keep showing the stale pre-disconnect status

#### Scenario: P2P conversation target nickname survives friend deletion and cold login

- **GIVEN** the user previously chatted with account A
- **AND** account A has a cloud user profile nickname
- **AND** account A has been deleted from the user's friend list
- **AND** the app has been uninstalled and reinstalled so local user caches are empty
- **WHEN** the user logs in and views the historical P2P conversation with account A
- **THEN** the conversation row MUST resolve and display A's cloud user profile nickname
- **AND** it MUST NOT fall back to displaying A's account ID while the profile can be fetched

#### Scenario: P2P conversation title falls back after remote friend deletion

- **GIVEN** the current device still shows a P2P conversation row for account A
- **AND** another endpoint deletes account A from the current user's friend list
- **WHEN** the current device receives the friend-deletion synchronization and re-renders the conversation list
- **THEN** the row title MUST stop showing the old friend remark
- **AND** the row title MUST fall back to account A's personal nickname when available

#### Scenario: Invited team conversation shows team nickname

- **GIVEN** user A creates a team or discussion group and invites user B
- **WHEN** user B receives the team entry notification and sees the team conversation in the conversation list
- **THEN** the conversation row MUST show the team nickname from joined-team metadata when available
- **AND** it MUST NOT keep showing the raw team id merely because the conversation source name was initialized with that id
