## MODIFIED Requirements

### Requirement: Send failure avoids duplicate failure prompts

The chat detail flow SHALL avoid duplicate failure prompts when a send failure already has message-level feedback in the timeline, and SHALL localize known SDK send or upload failure messages before any failure text is displayed to the user.

#### Scenario: Handling chat send failure

- **WHEN** the app has already marked the outgoing message as failed for a chat send or resend error
- **THEN** the page MUST NOT show a modal alert with the same failure meaning

#### Scenario: Known SDK send failure message is displayed

- **WHEN** a chat send failure exposes a known SDK English message such as `file upload failed`
- **THEN** any user-visible failure feedback SHALL use the current app language
- **AND** the app SHALL fall back to the contextual send-failure message when the SDK message is unknown
