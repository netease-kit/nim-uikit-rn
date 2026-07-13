## ADDED Requirements

### Requirement: Cloud Pagination Preserves Messages Tab Unread Dot

The app SHALL show unread indicators on bottom-tab entry points when relevant unread state exists.

#### Scenario: Cloud pagination does not clear the messages tab dot prematurely

- **GIVEN** cloud conversation mode is enabled
- **AND** the app has total unread messages after login
- **AND** the first loaded conversation page does not yet contain the unread conversations that account for that total
- **WHEN** the user loads more conversation pages or the app auto-reconciles the cloud conversation pagination state
- **THEN** the bottom messages tab icon MUST keep its unread red dot until the visible conversation unread state is fully reconciled
- **AND** the app MUST NOT clear the messages tab dot only because an intermediate pagination state temporarily reports zero displayed unread conversations
