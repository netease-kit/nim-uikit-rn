## ADDED Requirements

### Requirement: Empty chat detail must use notification-message styling

When a chat detail page has no messages to display, the page MUST show a centered notification-style "没有更多了" tip instead of a plain empty-message text block.

#### Scenario: Opening a conversation with no messages

- **WHEN** the chat detail page finishes loading and its message timeline is empty
- **THEN** the page MUST render a centered notification-style tip
- **AND** the tip copy MUST use the localized "没有更多了" text
