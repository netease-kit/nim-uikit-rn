## MODIFIED Requirements

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, unsupported-or-unknown message payloads, and reply-source previews with stable fallbacks required by the tests.

#### Scenario: Team nickname updates chat sender labels in realtime

- **WHEN** a member's nickname in the current team is changed
- **AND** the user is viewing a group chat containing messages from that member
- **THEN** the visible sender label for that member's group messages updates without requiring page re-entry
- **AND** the displayed sender name uses friend alias before team nickname, profile nickname, message-carried nickname, and account ID

#### Scenario: Reply source message is unavailable

- **GIVEN** a reply message references a source message
- **WHEN** the source message has been recalled, deleted, or is unavailable in the local message cache
- **THEN** RN MUST show the fallback copy `该消息已被撤回或删除`
- **AND** RN MUST NOT continue showing the source sender name in the reply preview title area

#### Scenario: Reply preview hydrates unloaded non-text source

- **GIVEN** a reply message references a source message that is an audio, file, image, video, location, custom, or other non-text message
- **AND** the source message exists in conversation history but is not in the local message cache because older history has not been loaded yet
- **WHEN** RN renders the reply message in chat detail
- **THEN** RN MUST fetch the missing source message by its reply refer
- **AND** RN MUST render the reply preview from the hydrated source message type
- **AND** RN MUST NOT show `该消息已被撤回或删除` solely because the source is outside the currently loaded history window

#### Scenario: Reply source message remains unavailable after hydration

- **GIVEN** a reply message references a source message
- **WHEN** RN cannot hydrate the source message because it has been recalled, deleted, or is unavailable from the SDK
- **THEN** RN MUST show the fallback copy `该消息已被撤回或删除`
- **AND** RN MUST NOT continue showing the source sender name in the reply preview title area

#### Scenario: Reply preview does not jump to a revoked or deleted source

- **GIVEN** a reply message is visible in the chat timeline
- **AND** its source message has been revoked, deleted, or is unavailable locally
- **WHEN** the user taps the reply preview area
- **THEN** RN MUST keep the current scroll position
- **AND** RN MUST NOT jump or scroll to the old source-message position

#### Scenario: Reply preview shows file-message label

- **GIVEN** a reply message references a file message
- **WHEN** RN renders the reply preview
- **THEN** the reply preview content MUST display `[文件消息]`
