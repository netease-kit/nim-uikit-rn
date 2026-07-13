## ADDED Requirements

### Requirement: Active Chat Resets Unread On Receive

The chat detail page SHALL reset unread state when new messages arrive for the currently active conversation.

#### Scenario: Receiving a message while already reading the conversation

- **WHEN** the user is currently staying on a chat detail page
- **AND** the app receives one or more messages for that same conversation
- **THEN** the chat detail flow MUST clear unread state for that conversation without waiting for the user to leave the page
- **AND** the existing read-receipt flow MUST continue to run for the received messages
