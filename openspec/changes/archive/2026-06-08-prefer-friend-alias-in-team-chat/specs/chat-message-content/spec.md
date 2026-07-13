## MODIFIED Requirements

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, and unsupported-or-unknown message payloads with stable fallbacks required by the tests.

#### Scenario: Team nickname updates chat sender labels in realtime

- **WHEN** a member's nickname in the current team is changed
- **AND** the user is viewing a group chat containing messages from that member
- **THEN** the visible sender label for that member's group messages updates without requiring page re-entry
- **AND** the displayed sender name uses friend alias before team nickname, profile nickname, message-carried nickname, and account ID

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible mention composition, metadata, deletion,
sending, receiving, and re-editing for text messages in team or discussion chats, and SHALL support
Android-compatible AI chat user mention composition in eligible P2P chats.

#### Scenario: Team mention selector uses native appellation priority

- **GIVEN** the user is composing in a team or discussion chat
- **AND** a team member has both a friend alias and a team nickname
- **WHEN** the user types `@`
- **THEN** the mention selector MUST show that member using friend alias before team nickname, profile nickname, and account ID
- **AND** selecting that member MUST insert the same alias-first display name into the composer mention text
