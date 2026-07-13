## MODIFIED Requirements

### Requirement: Chat detail read receipts follow UIKit presentation

The system SHALL render chat-detail message read receipts using the UIKit/H5 icon-and-progress presentation instead of plain text labels.

#### Scenario: AI P2P sent message shows read indicator

- **GIVEN** the chat detail page is showing a P2P conversation whose target account is an AI user
- **AND** a message sent by the current user has already succeeded
- **WHEN** the message row renders its read-receipt indicator
- **THEN** RN MUST show the UIKit read indicator in the fully read state
- **AND** RN MUST NOT keep that indicator in the pending unread state solely because no ordinary peer read-receipt event was reported
