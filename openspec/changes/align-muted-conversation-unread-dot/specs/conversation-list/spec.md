## MODIFIED Requirements

### Requirement: Conversation List Unread Indicators

The app SHALL render unread indicators differently for normal and muted conversations.

#### Scenario: Normal conversation with unread messages

- **WHEN** a non-muted conversation has unread messages
- **THEN** the app MUST display a red unread count badge
- **AND** counts above `99` MUST display as `99+`

#### Scenario: Muted conversation with unread messages

- **WHEN** a muted conversation has unread messages
- **THEN** the app MUST display the mute icon on the conversation row
- **AND** the app MUST NOT show the unread count number
- **AND** the app MUST display a gray unread indicator dot instead
