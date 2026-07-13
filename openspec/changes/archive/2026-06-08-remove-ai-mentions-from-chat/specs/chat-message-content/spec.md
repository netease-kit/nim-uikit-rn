## MODIFIED Requirements

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible mention composition, metadata, deletion,
sending, receiving, and re-editing for text messages in team or discussion chats.

#### Scenario: Team mention selector excludes AI users

- **GIVEN** the user is composing in a team or discussion chat
- **AND** one or more AI users are available locally, including AI users that are also team members
- **WHEN** the user types `@`
- **THEN** the mention selector MUST NOT show AI users
- **AND** the mention selector MAY continue to show `@所有人` when allowed and ordinary team members

#### Scenario: Team mention selector ignores friend alias

- **GIVEN** the user is composing in a team or discussion chat
- **AND** a team member has both a friend alias and a team nickname
- **WHEN** the user types `@`
- **THEN** the mention selector MUST show that member using team nickname before profile nickname and account ID
- **AND** the mention selector MUST NOT use the friend alias for that member
- **AND** selecting that member MUST insert the same alias-ignored display name into the composer mention text

#### Scenario: P2P mention selector is disabled

- **GIVEN** the user is composing in a P2P chat
- **WHEN** the user types `@`
- **THEN** RN MUST NOT open the mention selector for AI users
- **AND** the typed `@` MUST remain plain composer text unless another non-AI mention capability explicitly supports it
