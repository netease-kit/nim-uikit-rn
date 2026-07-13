## MODIFIED Requirements

### Requirement: Secondary Message Lists Use Chat Bubble Styling

The chat history page and pinned-message page SHALL render message rows with the same RN UIKit chat bubble styling as the chat detail timeline while preserving their page-specific search and action controls.

Non-chat-detail message surfaces SHALL align all message bubbles to the left, including messages sent by the current user; only the live chat detail page SHALL align current-user messages to the right.

Conversation settings surfaces SHALL NOT expose a visible `历史记录` entry; the existing history route MAY remain available for direct navigation or internal reuse.

Chat detail read receipt state SHALL be represented by icon/progress visuals only and MUST NOT render adjacent `已读` or `未读` text labels.

The pinned-message page reached from chat settings SHALL present each pinned item inside a standalone card that includes sender identity, pin time, a divider, message preview content, and a top-right overflow trigger aligned with the local Figma pinned-list design.

The pinned-message overflow trigger SHALL open an action sheet that exposes `取消标记`, `复制` when the message has copyable text content, and `转发`, while tapping the message preview area itself continues to open the original message content.

#### Scenario: Viewing history messages

- **WHEN** the user opens the chat history page
- **THEN** each visible message result uses the shared chat bubble renderer for its message content
- **AND** tapping a history message still opens the same detail or attachment viewer as before

#### Scenario: Viewing pinned messages

- **WHEN** the user opens the pinned-message page
- **THEN** each pinned message uses the shared chat bubble renderer for its message content
- **AND** the page still exposes actions to view the original message, forward it, and cancel the pin

#### Scenario: Opening pinned message overflow actions

- **WHEN** the user taps the top-right overflow action on a pinned-message card from the settings-entry list
- **THEN** the page opens a bottom action sheet matching the RN pinned-list design pattern
- **AND** the available actions include `取消标记` and `转发`
- **AND** the sheet includes `复制` only when the pinned message has copyable text content
