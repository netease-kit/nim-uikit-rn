## ADDED Requirements

### Requirement: Chat detail read receipts follow UIKit presentation

The system SHALL render chat-detail message read receipts using the UIKit/H5 icon-and-progress presentation instead of plain text labels.

#### Scenario: P2P message receipt uses UIKit indicator

- **WHEN** the chat detail page renders a sent P2P message with read-receipt visibility enabled
- **THEN** it MUST show the UIKit read indicator
- **AND** it MUST use the full-read icon when the peer has read the message
- **AND** it MUST use the pending progress indicator when the peer has not read the message

#### Scenario: Team message receipt uses UIKit indicator

- **WHEN** the chat detail page renders a sent team message with read-receipt visibility enabled
- **THEN** it MUST show the UIKit read indicator
- **AND** it MUST map the team read and unread counts to the indicator progress

#### Scenario: Team receipt keeps detail navigation

- **WHEN** a sent team message is not fully read
- **THEN** tapping the UIKit indicator MUST navigate to the message read-detail page

#### Scenario: Fully read team message does not require detail navigation

- **WHEN** a sent team message has no unread members remaining
- **THEN** the chat detail page MUST show the full-read icon state

#### Scenario: Sent-message receipt appears on the left side of the bubble

- **WHEN** the chat detail page renders a sent message receipt
- **THEN** the receipt indicator MUST appear on the left side of the sent-message bubble
- **AND** it MUST stay on the same row as the bubble instead of using a separate line
- **AND** it MUST align with the lower edge of the sent-message bubble content
