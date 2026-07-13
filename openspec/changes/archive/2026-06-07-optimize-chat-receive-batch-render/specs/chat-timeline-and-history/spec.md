## MODIFIED Requirements

### Requirement: Active Chat Resets Unread On Receive

The chat detail page SHALL send read receipts when new messages arrive for the currently active conversation. When multiple incoming-message events arrive in a short burst for the active session, the app SHALL coalesce those messages before updating the chat timeline and related conversation state so burst delivery is rendered through a batch update rather than one full refresh per event.

#### Scenario: Receiving a message while already reading the conversation

- **WHEN** the user is currently staying on a chat detail page
- **AND** the app receives one or more messages for that same conversation
- **THEN** the chat detail flow MUST send read receipts for the received messages without waiting for composer input or outgoing messages

#### Scenario: Receiving burst forwarded messages in the active chat

- **GIVEN** the user is currently staying on a chat detail page
- **WHEN** another user forwards multiple messages one by one into that current conversation
- **THEN** the app MUST coalesce the burst of incoming messages before applying chat timeline updates
- **AND** the app MUST process mention state, read receipts, and conversation refresh once for the coalesced burst
- **AND** the visible timeline MUST preserve message ordering
