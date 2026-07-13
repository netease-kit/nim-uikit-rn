## ADDED Requirements

### Requirement: Active Chat Incoming Messages Send Read Receipts

The chat detail flow SHALL send message read receipts as soon as the app receives new incoming messages for the currently active P2P or team chat.

#### Scenario: Peer receives while user is in chat

- **WHEN** the current user is viewing a P2P or team chat detail page
- **AND** another participant sends a new message to that conversation
- **THEN** the app MUST send the appropriate read receipt for the incoming message
- **AND** the sender MUST be able to see that message become read without waiting for the current user to type or send another message

#### Scenario: Sender receives a read-receipt update

- **WHEN** the sender is viewing a P2P or team chat detail page
- **AND** the app receives a P2P or team message read-receipt event for a sent message
- **THEN** the sent-message read indicator MUST update without waiting for another message-list change
