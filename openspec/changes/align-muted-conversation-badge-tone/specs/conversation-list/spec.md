## MODIFIED Requirements

### Requirement: Conversation List Mute Indicators

The app SHALL visually distinguish muted conversations in the conversation list.

#### Scenario: Muted conversation with unread messages

- **WHEN** a conversation is set to message mute and still has unread messages
- **THEN** the app MUST display the mute icon on the conversation row
- **AND** the unread badge MUST use a gray visual tone instead of the default red tone
- **AND** the mute icon and timestamp MUST remain non-overlapping
