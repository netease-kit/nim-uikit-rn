## MODIFIED Requirements

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible mention composition, metadata, deletion,
sending, receiving, and re-editing for text messages in team or discussion chats, and SHALL support
Android-compatible AI chat user mention composition in eligible P2P chats.

#### Scenario: Sending and receiving mention text

- **WHEN** the user sends a text message that contains one or more intact tracked mentions
- **THEN** the message MUST include Android-compatible `serverExtension.yxAitMsg` metadata for each mentioned account and range
- **AND** sent and received mention text MUST render as highlighted mention content in the chat bubble

#### Scenario: Sending mention-only text

- **WHEN** the user sends a team or discussion text message whose visible content is only an intact tracked mention such as `@xxx` or `@所有人`
- **THEN** the outgoing message MUST still include Android-compatible `serverExtension.yxAitMsg` metadata for that mention
- **AND** the mentioned account or all-members mention MUST receive the same mention response as when additional text follows the mention

#### Scenario: iOS nine-key replacement triggers mention selector

- **GIVEN** the user is composing in a team, discussion, or eligible P2P chat on a physical iPhone
- **WHEN** the iOS numeric nine-key keyboard replaces a just-entered punctuation character such as `.` with `@`
- **THEN** the chat composer MUST open the mention member selector
- **AND** selecting a candidate MUST replace that `@` with the tracked mention token at the same text position

#### Scenario: Team mention selector includes AI chat users

- **GIVEN** the user is composing in a team or discussion chat
- **WHEN** the user types `@`
- **THEN** the mention selector MUST include AI users whose `serverExtension.aiChat` value is `1`
- **AND** those AI users MUST be shown even when they are not members of the team or discussion
- **AND** when the `@所有人` candidate is visible, the AI users MUST appear below it and above ordinary team members

#### Scenario: P2P friend mention selector includes AI chat users

- **GIVEN** the user is composing in a P2P chat whose peer is not an AI user
- **AND** at least one AI user has `serverExtension.aiChat` value `1`
- **WHEN** the user types `@`
- **THEN** the mention selector MUST open and show the AI chat users
- **AND** selecting an AI chat user MUST insert a tracked mention token into the P2P composer

#### Scenario: Non-chat AI users are excluded

- **WHEN** the mention selector builds AI user candidates
- **THEN** AI users without `serverExtension.aiChat` equal to `1` MUST NOT be shown
