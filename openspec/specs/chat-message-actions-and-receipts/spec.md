# chat-message-actions-and-receipts Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

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

The chat module SHALL avoid broad concurrent pinned-message list refreshes for conversations that do not have active or tracked pinned-message state.

#### Scenario: Refresh pinned state on login or reconnect

- **GIVEN** a user has many conversations loaded in memory
- **WHEN** login status, connection status, or foreground restore triggers app-level pinned-message refresh
- **THEN** the app MUST refresh pinned-message state only for the active conversation and conversations with tracked pinned-message state
- **AND** the app MUST NOT call the pinned-message list API once per loaded conversation solely because the conversation is loaded

#### Scenario: Duplicate refresh for one conversation

- **GIVEN** a pinned-message list request for conversation A is already in flight
- **WHEN** another refresh path requests pinned-message state for conversation A
- **THEN** the app MUST reuse the in-flight request instead of starting a duplicate SDK request

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

The chat module SHALL support recall and local delete behaviors with the test-defined time limits, re-edit flows, list-preview updates, offline outcomes, and cross-endpoint synchronization. The two-minute recalled-message re-edit window SHALL start from the message revoke time, not from the original message send time, and expired recalled messages SHALL NOT expose the re-edit action after the user stays on, leaves, re-enters, or restarts the chat page. Recalled-message notices SHALL be recovered from persisted message extension data after offline synchronization, history loading, and process restart so both current-user and peer recalls remain visible.

#### Scenario: Recalling a message

- **WHEN** the user recalls a recall-eligible message
- **THEN** the timeline, conversation preview, and any dependent reply or mark state update according to the tests

#### Scenario: Re-editing shortly after recall

- **GIVEN** the user sent a text message more than two minutes ago
- **AND** the user recalled that message less than two minutes ago
- **WHEN** the user taps `重新编辑`
- **THEN** the app MUST allow re-editing that recalled message
- **AND** the app MUST restore the recalled text into the composer

#### Scenario: Re-editing after the recall edit window expires

- **GIVEN** the user recalled a text message more than two minutes ago
- **WHEN** the user is viewing the recalled message in the chat page
- **THEN** the app MUST NOT show the `重新编辑` action for that recalled message
- **AND** the app MUST keep the action hidden after leaving and re-entering the chat page

#### Scenario: Showing recall notices after offline synchronization

- **GIVEN** another user recalls a message while the current user is offline
- **WHEN** the current user logs in and opens the affected chat page
- **THEN** the recalled message notice MUST be shown in the chat timeline

#### Scenario: Showing recall notices and re-edit after process restart

- **GIVEN** the chat timeline contains recalled messages from the current user and from another user
- **WHEN** the app process is killed and the user reopens the chat page
- **THEN** all recalled-message notices MUST still be shown
- **AND** current-user recalled text messages MUST show `重新编辑` only while the persisted revoke time is still within the edit window

### Requirement: P2P And Team Read Receipts

The chat module SHALL render p2p read status and team read or unread detail entry points for supported message types and SHALL hide read indicators for messages that are still sending or that failed. For messages sent by the current user, read indicators MUST remain visible and visually adjacent to the message bubble even when the message is pinned or the chat page is in multi-select mode.

#### Scenario: Opening team read detail

- **WHEN** the user taps a supported team-message read indicator
- **THEN** the app opens the read or unread detail view for that message

#### Scenario: Receiving receipt updates in or out of chat

- **WHEN** read-receipt state changes while the user is on the chat page, on a detail page, or away from the chat page
- **THEN** the visible receipt state follows the workbook's real-time and off-page update rules

#### Scenario: Current user's pinned message keeps receipt visible

- **GIVEN** a message sent by the current user is pinned
- **AND** the message has a read or unread indicator
- **WHEN** the chat detail timeline renders the message
- **THEN** the pinned background MUST NOT cover the read or unread indicator
- **AND** the indicator MUST remain visible next to the message bubble

#### Scenario: Multi-select pinned message keeps receipt adjacent

- **GIVEN** a message sent by the current user is pinned
- **AND** the chat detail page is in multi-select mode
- **WHEN** the message row renders
- **THEN** the read or unread indicator MUST be positioned close to the message bubble
- **AND** it MUST NOT drift toward the left side of the row away from the bubble

### Requirement: Pinned Message Tip Alignment

The chat detail timeline SHALL align the pinned-message tip row according to message ownership.

#### Scenario: Current user's pinned message aligns tip to bubble right edge

- **GIVEN** a message sent by the current user is pinned in the chat detail timeline
- **WHEN** the pinned tip row is rendered below the message bubble
- **THEN** the pinned tip row SHALL align with the right edge of the message bubble

#### Scenario: Other user's pinned message keeps left-aligned tip

- **GIVEN** a message sent by another user is pinned in the chat detail timeline
- **WHEN** the pinned tip row is rendered below the message bubble
- **THEN** the pinned tip row SHALL remain left-aligned with the message bubble
