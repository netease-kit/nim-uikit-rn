## ADDED Requirements

### Requirement: Send failure avoids duplicate failure prompts

The chat detail flow SHALL avoid duplicate failure prompts when a send failure already has message-level feedback in the timeline.

#### Scenario: Handling chat send failure

- **WHEN** the app has already marked the outgoing message as failed for a chat send or resend error
- **THEN** the page MUST NOT show a modal alert with the same failure meaning
