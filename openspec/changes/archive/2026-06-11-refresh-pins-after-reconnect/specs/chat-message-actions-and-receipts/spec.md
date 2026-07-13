## MODIFIED Requirements

### Requirement: Message Action Panel

The chat module SHALL expose the long-press or action-panel operations required by the tests, including copy, reply, resend, revoke, delete, and pin or mark behaviors, SHALL vary the visible actions by message type and state, SHALL dismiss the action panel before showing a follow-up destructive confirmation dialog, and SHALL synchronize pin state changes from other users in real time or after reconnect when the original event was missed offline.

#### Scenario: Remote user pins a visible message

- **GIVEN** user A and user B are both viewing the same chat detail conversation
- **WHEN** user A pins a message
- **THEN** user B's visible message row MUST update to the pinned visual state without leaving and re-entering the chat
- **AND** the pinned hint MUST show the pin operator according to the existing display rules

#### Scenario: Remote user unpins a visible message

- **GIVEN** user A and user B are both viewing the same chat detail conversation
- **AND** a message is currently shown as pinned
- **WHEN** user A unpins that message
- **THEN** user B's visible message row MUST remove the pinned visual state without leaving and re-entering the chat

#### Scenario: Chat detail refreshes pin state after reconnect

- **GIVEN** the user stays on a chat detail page
- **AND** another endpoint pins or unpins a message while this device is offline
- **WHEN** the device reconnects and chat synchronization resumes
- **THEN** the visible message rows MUST update to the latest pin state without requiring the user to leave and re-enter the chat page

### Requirement: Pinned Message List Stability

The chat module SHALL provide a pinned-message list page that can distinguish empty data from load failure, allow retry after an initial load error, keep voice-message playback aligned with chat detail behavior, hide recalled messages from the pinned-message list, render each pinned source message at most once, remain visually stable while scrolling, and converge to the latest pinned-message state after reconnect if remote pin changes were missed while offline.

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

#### Scenario: Pinned-message list refreshes after reconnect

- **GIVEN** the user stays on the pinned-message list page
- **AND** another endpoint pins or unpins a message while this device is offline
- **WHEN** the device reconnects and chat synchronization resumes
- **THEN** the pinned-message list MUST update to the latest pinned set without requiring the user to leave and re-enter the page
