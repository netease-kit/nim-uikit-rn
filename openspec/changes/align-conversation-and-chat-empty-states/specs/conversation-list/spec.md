## ADDED Requirements

### Requirement: Conversation list empty state must show the standard illustration

When the current account has no conversations to display, the conversation list MUST render the standard empty-state illustration with the localized "暂无会话" copy.

#### Scenario: No conversations exist for the current account

- **WHEN** the conversation list finishes loading and there are zero visible conversations
- **THEN** the page MUST show the standard empty-state illustration
- **AND** the empty-state copy MUST use the localized conversation-empty text
