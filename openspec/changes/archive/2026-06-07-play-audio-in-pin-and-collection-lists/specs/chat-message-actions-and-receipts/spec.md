## MODIFIED Requirements

### Requirement: Pinned Message List Stability

The chat module SHALL provide a pinned-message list page that can distinguish empty data from load failure, allow retry after an initial load error, and keep voice-message playback aligned with chat detail behavior.

#### Scenario: Opening pinned messages when loading fails

- **WHEN** the pinned-message list cannot complete its initial load
- **THEN** the page shows a dedicated load-failure state and exposes a retry entry instead of treating the result as empty

#### Scenario: Playing audio from pinned messages

- **GIVEN** the pinned-message list renders a pinned voice message
- **WHEN** the user taps the voice message bubble
- **THEN** RN MUST play the voice message in the current page
- **AND** RN MUST show the same voice playback animation as the chat detail page
- **AND** RN MUST NOT open the voice attachment URL in the browser or another external app
