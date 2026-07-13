## MODIFIED Requirements

### Requirement: Chat detail read receipts follow UIKit presentation

The system SHALL render chat-detail message read receipts using the UIKit/H5 icon-and-progress presentation instead of plain text labels.

#### Scenario: Resent team message refreshes receipt counts

- **GIVEN** a sent team message failed and is visible in the chat detail timeline
- **WHEN** the user resends that failed message and the resend succeeds
- **THEN** the chat detail page MUST refresh the resent message's team read-receipt counts
- **AND** the receipt indicator MUST resolve counts by either the original failed-message identifier or the resent-message identifier returned by the SDK

#### Scenario: Resent team message keeps read-detail navigation

- **GIVEN** a failed team message has been resent successfully
- **WHEN** the user taps the message read-receipt indicator before or after the latest count refresh finishes
- **THEN** the app MUST navigate to the message read-detail page with the resent message's conversation and message identifier
- **AND** the tap target MUST remain available for fully read team messages as well as partially read team messages
