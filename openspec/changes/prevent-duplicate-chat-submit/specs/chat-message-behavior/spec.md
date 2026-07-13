## MODIFIED Requirements

### Requirement: Chat Submit Idempotency

The chat message module SHALL prevent repeated user taps on the same text-send or forward-confirm entry from creating duplicate asynchronous submit requests before the first submit attempt finishes.

#### Scenario: Repeatedly tapping the text send entry

- **GIVEN** the user has entered a valid text message in chat detail
- **WHEN** the user triggers the send entry multiple times before the first send attempt finishes
- **THEN** the client submits at most one text send request for that composed message

#### Scenario: Repeatedly tapping the forward confirm entry

- **GIVEN** the user has selected valid forward targets and opens the confirm dialog
- **WHEN** the user taps the confirm entry multiple times before the first forward attempt finishes
- **THEN** the client submits at most one forward request set for that confirm action
