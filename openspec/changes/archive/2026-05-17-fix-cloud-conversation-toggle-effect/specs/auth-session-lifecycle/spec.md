## MODIFIED Requirements

### Requirement: Logout clears cached IM view state

The app SHALL clear cached IM view state when the user logs out or when persisted auth session data is cleared.

#### Scenario: User logs out after viewing conversations in one mode

- **WHEN** the user logs out or persisted auth session data is cleared
- **THEN** local conversation, message, team, and user caches MUST be reset before the next login session
- **AND** the next login session MUST NOT render stale conversation data from the previous account or previous cloud-conversation mode
