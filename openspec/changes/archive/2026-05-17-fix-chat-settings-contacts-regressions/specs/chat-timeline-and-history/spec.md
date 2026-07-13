## ADDED Requirements

### Requirement: Reply Reference Location

The chat detail page SHALL locate the referenced source message in the current timeline when the user taps a reply preview.

#### Scenario: Tapping a reply reference

- **WHEN** the user taps the quoted message area inside a reply bubble
- **THEN** the chat page scrolls to the referenced source message in the current conversation
- **AND** the referenced source message is temporarily highlighted
- **AND** the app MUST NOT navigate to the standalone message detail page for this interaction

#### Scenario: Reply source is unavailable

- **WHEN** the user taps a quoted message area whose source message is no longer available in the current timeline
- **THEN** the app keeps the user on the chat page
- **AND** the app presents a localized unavailable-source message

### Requirement: Secondary Message Lists Use Chat Bubble Styling

The chat history page and pinned-message page SHALL render message rows with the same RN UIKit chat bubble styling as the chat detail timeline while preserving their page-specific search and action controls.

Non-chat-detail message surfaces SHALL align all message bubbles to the left, including messages sent by the current user; only the live chat detail page SHALL align current-user messages to the right.

Conversation settings surfaces SHALL NOT expose a visible `历史记录` entry; the existing history route MAY remain available for direct navigation or internal reuse.

Chat detail read receipt state SHALL be represented by icon/progress visuals only and MUST NOT render adjacent `已读` or `未读` text labels.

#### Scenario: Viewing history messages

- **WHEN** the user opens the chat history page
- **THEN** each visible message result uses the shared chat bubble renderer for its message content
- **AND** tapping a history message still opens the same detail or attachment viewer as before

#### Scenario: Viewing pinned messages

- **WHEN** the user opens the pinned-message page
- **THEN** each pinned message uses the shared chat bubble renderer for its message content
- **AND** the page still exposes actions to view the original message, forward it, and cancel the pin
