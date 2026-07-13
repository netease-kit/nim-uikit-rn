## MODIFIED Requirements

### Requirement: Offline And Multi-Endpoint Synchronization

The conversation module SHALL keep conversation rows usable during temporary network loss and SHALL converge row state after reconnect, account re-login, or another endpoint changes pin, mute, unread, deletion, or membership state. Team conversations that become invalid because the team was dismissed, the current user left, or the current user was removed MUST be pruned from the list before the user can re-enter them.

#### Scenario: Cloud conversation deleted by another endpoint while offline

- **GIVEN** cloud conversation mode is enabled
- **AND** the same account is logged in on two endpoints
- **AND** endpoint A is offline
- **WHEN** endpoint B deletes conversation A
- **AND** endpoint A reconnects and completes conversation refresh or sync
- **THEN** conversation A MUST be removed from endpoint A's visible conversation list
- **AND** it MUST NOT remain solely because it was cached in the in-memory cloud conversation store before reconnect

#### Scenario: Cloud conversation deleted by another endpoint while online

- **GIVEN** cloud conversation mode is enabled
- **AND** the same account is logged in on two online endpoints
- **WHEN** endpoint B deletes conversation A
- **THEN** endpoint A MUST remove conversation A from its visible conversation list after receiving the cloud conversation delete event
- **AND** conversation A MUST NOT reappear from RN local fallback conversation data
