## MODIFIED Requirements

### Requirement: Discussion Settings Page Copy

The app SHALL present discussion-group settings with discussion-specific copy and SHALL allow the current user, including the discussion owner, to exit from the settings page.

#### Scenario: Discussion settings page UI

- **WHEN** the user opens the settings page for a discussion group
- **THEN** the page title MUST be `设置`
- **AND** the page MUST show the discussion avatar and discussion name
- **AND** the member row MUST show member count and member avatars
- **AND** the page MUST include mark, history, notification, and stick-top settings
- **AND** the bottom action MUST be `退出讨论组`

#### Scenario: Discussion owner exits discussion group

- **WHEN** the current user owns a discussion group
- **AND** confirms `退出讨论组`
- **THEN** the app MUST complete the exit without showing `team owner quit not allowed`
- **AND** if another non-AI member exists, ownership MUST transfer to that member while the current user leaves
- **AND** if no other non-AI member exists, the discussion group MUST be dismissed
