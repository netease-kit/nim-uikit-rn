## ADDED Requirements

### Requirement: Message Action Panel

The chat module SHALL expose the long-press or action-panel operations required by the tests, including copy, reply, resend, revoke, delete, and pin or mark behaviors, and SHALL vary the visible actions by message type and state.

#### Scenario: Opening message actions

- **WHEN** the user long-presses or otherwise opens actions for a supported message
- **THEN** the app shows the allowed action set for that message type and state

### Requirement: Pinned Message List Stability

The chat module SHALL provide a pinned-message list page that can distinguish empty data from load failure and allow retry after an initial load error.

#### Scenario: Opening pinned messages when loading fails

- **WHEN** the pinned-message list cannot complete its initial load
- **THEN** the page shows a dedicated load-failure state and exposes a retry entry instead of treating the result as empty

### Requirement: Reply Interaction

The chat module SHALL support replying to self or others, linking back to the source message, defaulting `@` behavior where the tests require it, and degrading gracefully when the source message has been deleted or recalled.

#### Scenario: Replying to a message

- **WHEN** the user replies to a supported message type
- **THEN** the composer, reply chip, sent row, and source-message jump behavior follow the workbook rules

### Requirement: Failed Send Recovery

The chat module SHALL preserve failed-send rows and allow retry where the tests require resend behavior, including failures caused by network, deleted-friend, or blacklist state.

#### Scenario: Resending a failed message

- **WHEN** a resend-eligible message is in failed state and the user retries
- **THEN** the app attempts resend and updates the row state accordingly

#### Scenario: Anti-spam blocked failed message

- **WHEN** the user sends a message that is blocked by anti-spam logic
- **THEN** the failed row keeps its blocked state, the app appends the expected tips message, and the available long-press actions shrink to the workbook-defined subset

#### Scenario: Reporting from an anti-spam tip

- **WHEN** the chat page shows an anti-spam tips banner with a report affordance
- **THEN** the user can enter an in-app report surface instead of leaving the chat flow

### Requirement: Recall And Local Delete Behavior

The chat module SHALL support recall and local delete behaviors with the test-defined time limits, re-edit flows, list-preview updates, offline outcomes, and cross-endpoint synchronization.

#### Scenario: Recalling a message

- **WHEN** the user recalls a recall-eligible message
- **THEN** the timeline, conversation preview, and any dependent reply or mark state update according to the tests

### Requirement: P2P And Team Read Receipts

The chat module SHALL render p2p read status and team read or unread detail entry points for supported message types and SHALL hide read indicators for messages that are still sending or that failed.

#### Scenario: Opening team read detail

- **WHEN** the user taps a supported team-message read indicator
- **THEN** the app opens the read or unread detail view for that message

#### Scenario: Receiving receipt updates in or out of chat

- **WHEN** read-receipt state changes while the user is on the chat page, on a detail page, or away from the chat page
- **THEN** the visible receipt state follows the workbook's real-time and off-page update rules
