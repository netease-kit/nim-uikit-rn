# Capability: Conversation Mention Badge

## ADDED Requirements

### Requirement: Recalled mention messages do not keep conversation mention badges

The app SHALL remove a conversation mention badge when the only unread mention message for that conversation is recalled or deleted.

#### Scenario: Mention followed by normal message is recalled

- **GIVEN** a conversation has an unread mention message
- **AND** a later unread normal message is received
- **WHEN** the mention message is recalled
- **THEN** the conversation list SHALL NOT show `[有人@我]`
- **AND** the unread count SHALL NOT be cleared by this badge cleanup

#### Scenario: Other mention messages remain

- **GIVEN** a conversation has multiple unread mention messages
- **WHEN** one mention message is recalled or deleted
- **THEN** the conversation list SHALL continue showing `[有人@我]` if another unread mention remains

#### Scenario: Multiple mention messages are recalled around normal messages

- **GIVEN** A sends message 1 mentioning B in a team conversation
- **AND** A sends normal message 2
- **AND** A recalls message 1
- **AND** A sends message 3 mentioning B
- **WHEN** A recalls message 3
- **THEN** B's conversation list SHALL NOT show `[有人@我]`
- **AND** both local conversation rendering and im-store-v2 conversation rendering SHALL follow the same result
