## MODIFIED Requirements

### Requirement: Active Chat Keeps Conversation Unread State Cleared

The conversation list SHALL keep the unread badge cleared for a conversation while that conversation is actively open in the chat detail page.

#### Scenario: New message arrives in the currently open conversation

- **WHEN** the user is viewing a chat detail page for a conversation
- **AND** a new message for that same conversation is received
- **THEN** the app MUST immediately clear the unread state for that conversation in the active conversation store
- **AND** returning to the conversation list MUST NOT show a red dot or unread count for that message
