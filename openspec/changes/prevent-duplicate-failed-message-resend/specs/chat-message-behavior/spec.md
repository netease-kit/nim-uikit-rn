## MODIFIED Requirements

### Requirement: Failed Message Retry

The chat message module SHALL treat retrying the same failed outgoing message as an idempotent action and prevent repeated taps from creating duplicate resend requests before the first retry attempt finishes.

#### Scenario: Repeatedly tapping retry on the same failed message

- **GIVEN** a self-sent message is in the failed state in chat detail
- **AND** the user can access a retry entry for that message
- **WHEN** the user taps the retry entry multiple times before the first retry attempt completes
- **THEN** the client submits at most one resend request for that failed message
- **AND** the conversation only produces one resent outgoing message from that retry attempt
