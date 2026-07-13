## MODIFIED Requirements

### Requirement: Conversation Preview Rendering

The conversation list SHALL render preview text using the same latest-message summary rules as chat detail, including long-message exposure style, alignment, sender labeling, anti-fraud notice rows, and `@` markers where the tests require them. Team messages that mention the current user directly or through `ait_all` SHALL mark the row with `[有人@我]` only while the unread range for that conversation still contains at least one unread, non-recalled `@` message. Recalled non-mention messages MUST NOT remove a still-unread earlier mention from the mention calculation window.

#### Scenario: Rendering conversation preview content

- **WHEN** conversations contain long text, muted messages, `@` mentions, or system-style updates
- **THEN** the preview row content and indicators follow the test-defined display rules

#### Scenario: Current user is mentioned in a team conversation

- **WHEN** a received team message contains `serverExtension.yxAitMsg` for the current account or `ait_all`
- **AND** the conversation is not the currently open chat
- **THEN** the conversation row preview MUST show the `[有人@我]` prefix before the latest-message preview
- **AND** opening or clearing the conversation MUST remove that mention prefix from the row

#### Scenario: Mentioned message becomes read

- **WHEN** the conversation still contains historical `@我` messages
- **AND** none of those `@我` messages remain inside the current unread range
- **THEN** the conversation row MUST NOT continue showing the `[有人@我]` prefix

#### Scenario: Later normal message is recalled after an unread mention

- **GIVEN** a team conversation has an unread `@我` message
- **AND** a later unread normal message is received
- **WHEN** the later normal message is recalled
- **THEN** the conversation row MUST continue showing the `[有人@我]` prefix
- **AND** the latest-message preview MAY show the recall text after the prefix
- **AND** both local conversation rendering and im-store-v2 conversation rendering MUST use the same result

#### Scenario: Recalled later message remains in local timeline

- **GIVEN** a team conversation has an unread `@我` message followed by an unread normal message
- **AND** the normal message is recalled and remains in the local timeline as a recalled placeholder
- **WHEN** the conversation list recomputes the unread mention state
- **THEN** the recalled placeholder MUST be ignored when locating unread messages
- **AND** the earlier unread `@我` message MUST still keep `[有人@我]` visible

#### Scenario: Loaded chat history fills missing row preview

- **WHEN** a conversation row has no source `lastMessage`
- **AND** the chat detail message cache for that conversation contains at least one message
- **THEN** the conversation row MUST render the latest cached message preview instead of `暂无消息`
- **AND** the row timestamp MUST use that latest cached message time when the source conversation has no newer timestamp
