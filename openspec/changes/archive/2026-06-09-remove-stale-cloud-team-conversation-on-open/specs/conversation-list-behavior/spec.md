## MODIFIED Requirements

### Requirement: Offline And Multi-Endpoint Synchronization

The conversation module SHALL keep conversation rows usable during temporary network loss and SHALL converge row state after reconnect, account re-login, or another endpoint changes pin, mute, unread, deletion, or membership state. Team conversations that become invalid because the team was dismissed, the current user left, or the current user was removed MUST be pruned from the list before the user can re-enter them.

#### Scenario: Stale cloud team conversation is opened after offline dismissal

- **GIVEN** cloud conversation mode is enabled
- **AND** the current account was invited into team A
- **AND** the current account logs out before team A is dismissed
- **WHEN** the account logs in again, switches to cloud conversations, and opens the stale team A conversation row
- **THEN** RN MUST show a confirmation alert indicating the team has been dismissed or the user is no longer a member
- **AND** after confirmation RN MUST return to the conversation list
- **AND** RN MUST delete the active cloud conversation and remove any local fallback row for that conversation
