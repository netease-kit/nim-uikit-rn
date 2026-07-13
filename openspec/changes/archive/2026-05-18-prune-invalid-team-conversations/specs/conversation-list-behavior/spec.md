## MODIFIED Requirements

### Requirement: Offline And Multi-Endpoint Synchronization

The conversation module SHALL keep conversation rows usable during temporary network loss and SHALL converge row state after reconnect, account re-login, or another endpoint changes pin, mute, unread, deletion, or membership state. Team conversations that become invalid because the team was dismissed, the current user left, or the current user was removed MUST be pruned from the list before the user can re-enter them.

#### Scenario: Syncing state after network or endpoint changes

- **WHEN** the user or another endpoint changes conversation state during offline, reconnect, or multi-end sessions
- **THEN** the visible list converges to the latest valid row state defined by the tests

#### Scenario: Invalid team conversation appears in the local list

- **WHEN** the current conversation list still contains a team conversation whose team has been dismissed, is no longer valid, or no longer includes the current user
- **THEN** the app MUST remove that conversation row from the conversation list
- **AND** the conversation list page MUST filter that row before it becomes tappable
- **AND** tapping that row MUST NOT navigate into a broken team chat detail page
