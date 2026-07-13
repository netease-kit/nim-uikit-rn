## MODIFIED Requirements

### Requirement: Active Chat Resets Unread On Receive

The chat detail page SHALL send read receipts when new messages arrive for the currently active conversation.

#### Scenario: Receiving a message while already reading the conversation

- **WHEN** the user is currently staying on a chat detail page
- **AND** the app receives one or more messages for that same conversation
- **THEN** the chat detail flow MUST send read receipts for the received messages without waiting for composer input or outgoing messages
