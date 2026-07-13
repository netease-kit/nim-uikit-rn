## ADDED Requirements

### Requirement: Pinned Message Sender Uses Team Nickname In Team Chats

The chat detail module SHALL show the sender identity in the pinned-message list using the team-chat appellation context when the pinned message belongs to a team conversation.

#### Scenario: Pinned team message sender shows team nickname

- **GIVEN** the pinned-message list contains a message from a team conversation
- **WHEN** RN renders the sender avatar and sender name in that pinned-message row
- **THEN** RN MUST pass the team conversation context to the shared UIKit identity components
- **AND** the sender display name MUST follow the existing team-chat appellation rules, including team nickname priority
