# chat-timeline-and-history Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Chat Header And Timeline Identity

The chat detail page SHALL render a usable timeline, composer, header actions, conversation metadata, and p2p peer online status where applicable.

#### Scenario: P2P chat peer status updates

- **WHEN** the user opens a one-to-one chat page
- **THEN** the app subscribes to the peer's user status
- **AND** the header shows `在线` when the peer status is online
- **AND** the header shows `离线` when the peer status is offline or unknown

#### Scenario: Large timeline remains responsive on entry

- **WHEN** the user opens a conversation that already contains a large amount of local history
- **THEN** the chat detail page MUST use a virtualized message list rather than eagerly mounting all message rows
- **AND** the page MUST remain responsive enough to enter the detail view before older history finishes paging in

### Requirement: Time Grouping And Formatting

The chat timeline SHALL group and format message times according to the test-driven rules for nearby messages, historical pages, resumed sessions, and manual system-time changes.

#### Scenario: Rendering timeline time sections

- **WHEN** the visible messages span multiple time groups
- **THEN** the app inserts the expected time separators and timestamp formatting

### Requirement: History Loading And Positioning

The chat module SHALL load recent and older history, position the user at the newest relevant message on entry, and preserve the existing timeline while more history is fetched.

#### Scenario: Opening chat with unread or offline history

- **WHEN** the user enters chat from a conversation row or notification with unread or offline-synced messages
- **THEN** the page MUST enter the chat detail route without blocking on a full history preload
- **AND** the page MUST asynchronously load only the required recent history window for first paint
- **AND** the page MUST position the user according to the test rules after that initial window is rendered

#### Scenario: Loading history messages

- **WHEN** the user opens chat or requests older messages
- **THEN** the app MUST load the expected history window in paged batches instead of rendering the entire local history set at once
- **AND** the timeline MUST preserve the already rendered messages while more history is fetched
- **AND** the page MUST show the corresponding load state

#### Scenario: History page initial load fails

- **WHEN** the standalone history page cannot load its initial message set
- **THEN** the page keeps that failure state distinct from an actually empty history result and provides a retry action

#### Scenario: Recovering after reconnect

- **WHEN** history loading fails because of lost connectivity and the network later returns
- **THEN** the app retries history synchronization without losing the current timeline state

### Requirement: Offline Chat Surface Stability

The chat page SHALL remain navigable while offline, preserve local timeline content, and keep incoming remote state transitions consistent once connectivity returns.

#### Scenario: Staying on chat while network conditions change

- **WHEN** the user opens chat during offline, reconnect, or network-switch periods
- **THEN** the page keeps a stable timeline and surfaces the expected recovery behavior

### Requirement: Active Chat Resets Unread On Receive

The chat detail page SHALL send read receipts when new messages arrive for the currently active conversation. When multiple incoming-message events arrive in a short burst for the active session, the app SHALL coalesce those messages before updating the chat timeline and related conversation state so burst delivery is rendered through a batch update rather than one full refresh per event.

#### Scenario: Receiving a message while already reading the conversation

- **WHEN** the user is currently staying on a chat detail page
- **AND** the app receives one or more messages for that same conversation
- **THEN** the chat detail flow MUST send read receipts for the received messages without waiting for composer input or outgoing messages

#### Scenario: Receiving burst forwarded messages in the active chat

- **GIVEN** the user is currently staying on a chat detail page
- **WHEN** another user forwards multiple messages one by one into that current conversation
- **THEN** the app MUST coalesce the burst of incoming messages before applying chat timeline updates
- **AND** the app MUST process mention state, read receipts, and conversation refresh once for the coalesced burst
- **AND** the visible timeline MUST preserve message ordering

### Requirement: Reply Reference Location

The chat detail page SHALL locate the referenced source message in the current timeline when the user taps a reply preview.

#### Scenario: Tapping a reply reference

- **WHEN** the user taps the quoted message area inside a reply bubble
- **THEN** the chat page scrolls to the referenced source message in the current conversation
- **AND** the referenced source message is temporarily highlighted
- **AND** the app MUST NOT navigate to the standalone message detail page for this interaction

#### Scenario: Reply source is unavailable

- **WHEN** the user taps a quoted message area whose source message is no longer available in the current timeline
- **THEN** the app keeps the user on the chat page
- **AND** the app presents a localized unavailable-source message

### Requirement: Secondary Message Lists Use Chat Bubble Styling

The chat history page and pinned-message page SHALL render message rows with the same RN UIKit chat bubble styling as the chat detail timeline while preserving their page-specific search and action controls.

Non-chat-detail message surfaces SHALL align all message bubbles to the left, including messages sent by the current user; only the live chat detail page SHALL align current-user messages to the right.

Conversation settings surfaces SHALL NOT expose a visible `历史记录` entry; the existing history route MAY remain available for direct navigation or internal reuse.

Chat detail read receipt state SHALL be represented by icon/progress visuals only and MUST NOT render adjacent `已读` or `未读` text labels.

The pinned-message page reached from chat settings SHALL present each pinned item inside a standalone card that includes sender identity, pin time, a divider, message preview content, and a top-right overflow trigger aligned with the local Figma pinned-list design.

The pinned-message overflow trigger SHALL open an action sheet that exposes `取消标记`, `复制` when the message has copyable text content, and `转发`, while tapping the message preview area itself continues to open the original message content.

#### Scenario: Viewing history messages

- **WHEN** the user opens the chat history page
- **THEN** each visible message result uses the shared chat bubble renderer for its message content
- **AND** tapping a history message still opens the same detail or attachment viewer as before

#### Scenario: Viewing pinned messages

- **WHEN** the user opens the pinned-message page
- **THEN** each pinned message uses the shared chat bubble renderer for its message content
- **AND** the page still exposes actions to view the original message, forward it, and cancel the pin

#### Scenario: Opening pinned message overflow actions

- **WHEN** the user taps the top-right overflow action on a pinned-message card from the settings-entry list
- **THEN** the page opens a bottom action sheet matching the RN pinned-list design pattern
- **AND** the available actions include `取消标记` and `转发`
- **AND** the sheet includes `复制` only when the pinned message has copyable text content

### Requirement: Chat New Message Notice Presentation

The chat detail page SHALL present the new-message notice on the right side with a down-arrow icon
and count-based copy when new messages arrive, and SHALL present the same shortcut as an icon-only
scroll-to-bottom affordance when the user is browsing older history without pending new messages.
When the user is browsing older history, incoming messages for the current conversation SHALL NOT
auto-scroll the timeline away from the user's current history position or shift the visible history
by the height of the newly inserted messages. Same-account messages synced from another endpoint
SHALL render in the timeline but SHALL NOT contribute to the new-message notice count. Newly
arrived messages that are later revoked SHALL be removed from the new-message notice count. When
the user leaves the chat detail route from the latest-message position to chat settings, system
media/file/camera entry points, or message-detail viewers and messages arrive before the user
returns, the page SHALL render those newly arrived latest messages in the timeline while preserving
the user's previous visual position instead of jumping directly to the latest message. While the
user is browsing older history, tapping composer controls including the text input, voice input,
emoji input, image/video input, and more input SHALL scroll the chat timeline to the latest message
before applying the composer state change. The new-message notice count SHALL decrease as the newly
arrived messages become viewable during manual scrolling or become revoked. The shortcut SHALL be
rendered inside the composer dock and positioned absolutely relative to that composer module rather
than relying on page-level fixed mode-specific bottom offsets. Lightweight chat-page toast messages
SHALL use the same composer-relative placement pattern so they are not covered by the input module.
Tapping the count-based new-message notice SHALL reliably land the user on the latest message
position even when that tap also reveals deferred latest messages, clears the count badge, or
causes the shortcut to transition to the icon-only affordance during Android list re-layout.

#### Scenario: Same-account messages sync from another endpoint while user is away from bottom

- **GIVEN** the user is viewing a chat detail page and is not near the latest message
- **WHEN** a message sent by the same account from another endpoint syncs into this page
- **THEN** the page SHALL NOT automatically scroll to the latest message
- **AND** the currently visible historical messages SHALL remain visually anchored without intermediate flicker
- **AND** the synced message SHALL render in the timeline
- **AND** the synced message SHALL NOT contribute to the new-message notice count

#### Scenario: Newly arrived notice message is revoked while user is browsing history

- **GIVEN** the user is browsing older history in a chat detail page
- **AND** multiple newly arrived messages are represented by a new-message notice count
- **WHEN** one of those newly arrived messages is revoked before the user scrolls to it
- **THEN** the revoked message SHALL be removed from the new-message notice count
- **AND** if other newly arrived messages remain, the notice count SHALL update to the remaining count
- **AND** if no newly arrived messages remain, the count-based notice SHALL disappear and only the icon-only scroll-to-bottom shortcut SHALL remain visible

#### Scenario: Tapping the new-message notice while Android is browsing history

- **GIVEN** the user is browsing older history in the chat detail page on Android
- **AND** one or more newer tail messages are represented by the count-based new-message notice
- **WHEN** the user taps that notice
- **THEN** the page SHALL scroll to the latest message position
- **AND** the page SHALL NOT remain anchored at the old history position after the notice switches to the icon-only shortcut

### Requirement: Chat history exhaustion feedback must reflect real pagination state

The chat detail screen MUST show the "no more" history indicator only after older-history pagination is actually exhausted.

#### Scenario: Older history still available

- **GIVEN** the chat detail screen has already rendered some historical messages
- **AND** older history can still be fetched
- **WHEN** the current batch finishes rendering
- **THEN** the timeline must not show the "no more" history indicator

#### Scenario: Older history loading in progress

- **GIVEN** the chat detail screen is currently requesting older history
- **WHEN** the loading request has not finished yet
- **THEN** the timeline must not show the "no more" history indicator during that loading state

#### Scenario: Older history fully exhausted

- **GIVEN** the chat detail screen has fetched history until no older messages remain
- **WHEN** the history exhaustion state is confirmed
- **THEN** the timeline may show the "no more" history indicator

### Requirement: History Pagination Must Not Skip Interleaved Messages

The chat module SHALL keep upward history pagination aligned with the Android and iOS native implementations, and repeated upward pagination SHALL NOT skip older messages because of local anchor resets or unstable message merging.

#### Scenario: Loading earlier messages across multiple pages

- **WHEN** the user keeps scrolling upward to load multiple pages of older history
- **THEN** RN MUST request history with the earliest loaded message as the anchor and that message time as the pagination boundary
- **AND** the stored history anchor MUST only move toward older messages instead of being reset to a newer page by later syncs

#### Scenario: Merging historical messages with partial message identifiers

- **WHEN** RN merges historical pages that contain messages missing either `messageClientId` or `messageServerId`
- **THEN** the local merge logic MUST still preserve distinct messages instead of collapsing them into one entry
- **AND** the rendered chat history MUST remain ordered from older to newer without interleaved gaps
