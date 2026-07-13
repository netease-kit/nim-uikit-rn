## MODIFIED Requirements

### Requirement: Forwarding Payload Fidelity

Forwarded payloads SHALL preserve or intentionally transform reply state, `@` content, read-receipt settings, remarks, mark state, and attachment summaries exactly as the tests define for each forwarding mode. Single-message and serial forwarding of text messages containing `serverExtension.yxAitMsg` SHALL keep the visible mention text and compatible mention metadata so the forwarded bubble still renders mentions consistently.

#### Scenario: Forwarding messages with reply, `@`, or receipt metadata

- **WHEN** the selected messages include reply chains, mentions, marked rows, or read-receipt-sensitive content
- **THEN** the generated forwarded message follows the workbook's metadata-preservation rules

#### Scenario: Forwarding a text message with mention metadata

- **WHEN** the user forwards a text message that contains `serverExtension.yxAitMsg`
- **THEN** the forwarded message MUST preserve the visible `@` text and mention metadata for chat bubble rendering
- **AND** merged-forward summaries MUST keep the visible text content without introducing a new current-user mention marker in the target conversation unless the forwarded message is sent as a normal text payload with compatible mention metadata
