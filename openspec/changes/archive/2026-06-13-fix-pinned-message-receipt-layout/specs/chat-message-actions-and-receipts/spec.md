## MODIFIED Requirements

### Requirement: P2P And Team Read Receipts

The chat module SHALL render p2p read status and team read or unread detail entry points for supported message types and SHALL hide read indicators for messages that are still sending or that failed. For messages sent by the current user, read indicators MUST remain visible and visually adjacent to the message bubble even when the message is pinned or the chat page is in multi-select mode.

#### Scenario: Opening team read detail

- **WHEN** the user taps a supported team-message read indicator
- **THEN** the app opens the read or unread detail view for that message

#### Scenario: Receiving receipt updates in or out of chat

- **WHEN** read-receipt state changes while the user is on the chat page, on a detail page, or away from the chat page
- **THEN** the visible receipt state follows the workbook's real-time and off-page update rules

#### Scenario: Current user's pinned message keeps receipt visible

- **GIVEN** a message sent by the current user is pinned
- **AND** the message has a read or unread indicator
- **WHEN** the chat detail timeline renders the message
- **THEN** the pinned background MUST NOT cover the read or unread indicator
- **AND** the indicator MUST remain visible next to the message bubble

#### Scenario: Multi-select pinned message keeps receipt adjacent

- **GIVEN** a message sent by the current user is pinned
- **AND** the chat detail page is in multi-select mode
- **WHEN** the message row renders
- **THEN** the read or unread indicator MUST be positioned close to the message bubble
- **AND** it MUST NOT drift toward the left side of the row away from the bubble
