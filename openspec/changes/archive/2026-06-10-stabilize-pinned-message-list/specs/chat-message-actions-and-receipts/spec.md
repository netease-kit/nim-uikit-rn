## MODIFIED Requirements

### Requirement: Pinned Message List Stability

The chat module SHALL provide a pinned-message list page that can distinguish empty data from load failure, allow retry after an initial load error, keep voice-message playback aligned with chat detail behavior, hide recalled messages from the pinned-message list, render each pinned source message at most once, and remain visually stable while scrolling.

#### Scenario: Opening pinned messages when loading fails

- **WHEN** the pinned-message list cannot complete its initial load
- **THEN** the page shows a dedicated load-failure state and exposes a retry entry instead of treating the result as empty

#### Scenario: Playing audio from pinned messages

- **GIVEN** the pinned-message list renders a pinned voice message
- **WHEN** the user taps the voice message bubble
- **THEN** RN MUST play the voice message in the current page
- **AND** RN MUST show the same voice playback animation as the chat detail page
- **AND** RN MUST NOT open the voice attachment URL in the browser or another external app

#### Scenario: Recalled pinned message disappears from pinned list

- **GIVEN** a message is pinned in a chat conversation
- **WHEN** that message is recalled
- **THEN** the chat timeline SHALL continue to show the recalled-message notice according to recall rules
- **AND** the message SHALL no longer be treated as pinned
- **AND** the pinned-message list SHALL NOT render a row for that recalled message
- **AND** the pinned-message list SHALL NOT show the recalled-message placeholder text for that recalled message

#### Scenario: Duplicate pinned records resolve to one list row

- **GIVEN** the SDK or local pin map contains multiple pin records that reference the same source message by client id or server id
- **WHEN** the user opens the pinned-message list
- **THEN** the pinned-message list SHALL render only one row for that source message
- **AND** the row key SHALL remain stable while the list refreshes

#### Scenario: Scrolling pinned message list remains stable

- **GIVEN** the pinned-message list contains multiple rich message bubbles
- **WHEN** the user scrolls the pinned-message list
- **THEN** the list SHALL NOT flicker
- **AND** the list SHALL NOT show a transient white screen caused by recycled or clipped rows
