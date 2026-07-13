## MODIFIED Requirements

### Requirement: Logout Clears Cached IM View State

The app SHALL clear cached IM view state when the user logs out, when persisted auth session data is cleared, and before a different IM account is allowed to enter the authenticated shell.

#### Scenario: User logs out after viewing conversations in one mode

- **WHEN** the user logs out or persisted auth session data is cleared
- **THEN** local conversation, message, team, and user caches MUST be reset before the next login session
- **AND** the next login session MUST NOT render stale conversation data from the previous account or previous cloud-conversation mode

#### Scenario: Switching to another account after an existing session

- **WHEN** the user starts a new login flow while another IM account still has local session state in memory or storage
- **THEN** the app MUST clear the previous account's local conversation, message, friend, team, and user caches before exposing the new authenticated session
- **AND** the new account's conversation list MUST NOT render rows, unread state, or preview data from the previous account
