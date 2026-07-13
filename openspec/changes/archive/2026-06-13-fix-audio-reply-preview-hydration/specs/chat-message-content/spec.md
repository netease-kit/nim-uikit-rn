## MODIFIED Requirements

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, unsupported-or-unknown message payloads, and reply-source previews with stable fallbacks required by the tests.

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
