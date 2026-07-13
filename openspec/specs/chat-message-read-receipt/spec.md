# chat-message-read-receipt Specification

## Purpose

TBD - created by archiving change align-chat-read-receipt-with-uikit. Update Purpose after archive.

## Requirements

### Requirement: Chat detail read receipts follow UIKit presentation

The system SHALL render chat-detail message read receipts using the UIKit/H5 icon-and-progress presentation instead of plain text labels.

#### Scenario: P2P message receipt uses UIKit indicator

- **WHEN** the chat detail page renders a sent P2P message with read-receipt visibility enabled
- **THEN** it MUST show the UIKit read indicator
- **AND** it MUST use the full-read icon when the peer has read the message
- **AND** it MUST use the pending progress indicator when the peer has not read the message

#### Scenario: Team message receipt uses UIKit indicator

- **WHEN** the chat detail page renders a sent team message with read-receipt visibility enabled
- **THEN** it MUST show the UIKit read indicator
- **AND** it MUST map the team read and unread counts to the indicator progress

#### Scenario: Large teams hide the receipt indicator

- **WHEN** the chat detail page renders a sent team message for a team whose member count exceeds 100
- **THEN** it MUST hide the read-receipt indicator
- **AND** teams with 100 or fewer members MUST keep the UIKit indicator behavior

#### Scenario: Team receipt keeps detail navigation

- **WHEN** a sent team message has a UIKit read indicator
- **THEN** tapping the UIKit indicator MUST navigate to the message read-detail page
- **AND** the read-detail page MUST be registered in the root navigation stack so it is visible
- **AND** the navigation params MUST NOT reuse root-level push notification params that redirect to chat detail

#### Scenario: Fully read team message does not require detail navigation

- **WHEN** a sent team message has no unread members remaining
- **THEN** the chat detail page MUST show the full-read icon state
- **AND** tapping the full-read icon MUST navigate to the message read-detail page

#### Scenario: Empty read-member list uses testcase copy

- **WHEN** the read-detail page opens on the "已读" tab and there are no read members yet
- **THEN** it MUST show the empty-state title `全部成员未读`

#### Scenario: Read-detail header reserves status bar space

- **WHEN** the read-detail page renders on a device with a non-zero top safe-area inset
- **THEN** the page header MUST reserve the top safe-area height before the title row

#### Scenario: Read-receipt setting toggles receipt visibility for current messages

- **WHEN** the user turns the read-receipt setting off
- **THEN** the chat detail page MUST hide read-receipt indicators for sent messages, including messages that were already visible before the toggle changed
- **AND WHEN** the user turns the setting on again
- **THEN** the chat detail page MUST show the available read-receipt indicators again for those messages

#### Scenario: Sent-message receipt appears on the left side of the bubble

- **WHEN** the chat detail page renders a sent message receipt
- **THEN** the receipt indicator MUST appear on the left side of the sent-message bubble
- **AND** it MUST stay on the same row as the bubble instead of using a separate line
- **AND** it MUST align with the lower edge of the sent-message bubble content

#### Scenario: Resent team message refreshes receipt counts

- **GIVEN** a sent team message failed and is visible in the chat detail timeline
- **WHEN** the user resends that failed message and the resend succeeds
- **THEN** the chat detail page MUST refresh the resent message's team read-receipt counts
- **AND** the receipt indicator MUST resolve counts by either the original failed-message identifier or the resent-message identifier returned by the SDK

#### Scenario: Resent team message keeps read-detail navigation

- **GIVEN** a failed team message has been resent successfully
- **WHEN** the user taps the message read-receipt indicator before or after the latest count refresh finishes
- **THEN** the app MUST navigate to the message read-detail page with the resent message's conversation and message identifier
- **AND** the tap target MUST remain available for fully read team messages as well as partially read team messages

#### Scenario: Loading team history refreshes sent-message receipt counts

- **GIVEN** the user is viewing a team chat detail page
- **AND** the timeline loads an initial history page or an older history page that contains sent team messages from the current user
- **WHEN** those historical messages are rendered in the timeline
- **THEN** the app MUST refresh those messages' team read-receipt counts without requiring the user to open the read-detail page first
- **AND** the timeline's read-receipt indicators MUST converge to the latest read and unread counts for those historical messages

#### Scenario: AI P2P sent message shows read indicator

- **GIVEN** the chat detail page is showing a P2P conversation whose target account is an AI user
- **AND** a message sent by the current user has already succeeded
- **WHEN** the message row renders its read-receipt indicator
- **THEN** RN MUST show the UIKit read indicator in the fully read state
- **AND** RN MUST NOT keep that indicator in the pending unread state solely because no ordinary peer read-receipt event was reported

### Requirement: Active Chat Incoming Messages Send Read Receipts

The chat detail flow SHALL send message read receipts as soon as the app receives new incoming messages for the currently active P2P or team chat. A chat is considered active for sending incoming-message read receipts only while its chat detail route is focused, the app is in the foreground `active` state, and the user is viewing the latest-message area rather than browsing historical messages.

#### Scenario: Returning from Android background sends pending read receipts

- **GIVEN** the current user is viewing conversation A's focused P2P chat detail page on Android
- **AND** the chat timeline is in the latest-message readable area
- **WHEN** the app moves to the background and conversation A receives a new message
- **AND** the user returns the app to the foreground while still on conversation A's chat detail page
- **THEN** RN MUST wait until the IM connection reports connected
- **AND** RN MUST wait until the IM login status is send-ready
- **AND** RN MUST wait until the pending incoming message is available in the local chat message store
- **AND** RN MUST send a read receipt for the pending incoming message after that successful reconnect and local message availability
- **AND** RN MUST clear conversation A's unread count
- **AND** transient `illegal state` failures during reconnect MUST keep the pending read-receipt recovery queued for retry

#### Scenario: Returning from Android background preserves history browsing

- **GIVEN** the current user is viewing conversation A's focused chat detail page on Android
- **AND** the user is browsing historical messages away from the latest-message area
- **WHEN** the app moves to the background and conversation A receives a new message
- **AND** the user returns the app to the foreground
- **THEN** RN MUST NOT send a read receipt until the user returns to the latest-message area
- **AND** RN MUST keep the new-message reminder available

#### Scenario: Returning from an external chat surface keeps new messages hidden

- **GIVEN** the current user is viewing conversation A's focused chat detail page at the latest-message position
- **WHEN** the user opens chat settings, a system image/video/file/camera surface, or a message detail page from the chat detail page
- **AND** conversation A receives a new incoming message while that surface is open
- **AND** the user returns to conversation A's chat detail page
- **THEN** RN MUST NOT directly reveal the new incoming message in the visible timeline
- **AND** RN MUST show the new-message reminder and the shortcut-to-latest affordance
- **AND** RN MUST NOT send a read receipt until the user explicitly returns to the latest-message area

#### Scenario: Shortcut to latest sends pending read receipt

- **GIVEN** conversation A has pending incoming messages hidden behind the `x条新消息` shortcut
- **WHEN** the user taps the shortcut to jump to the latest-message area
- **THEN** RN MUST reveal the pending latest messages
- **AND** RN MUST send read receipts for the latest incoming messages in conversation A
- **AND** RN MUST clear conversation A's unread count

#### Scenario: All pending hidden messages are revoked before return

- **GIVEN** the current user opens chat settings from conversation A while viewing the latest-message area
- **AND** conversation A receives new incoming messages while settings is open
- **AND** all of those new incoming messages are revoked before the user returns to the chat page
- **WHEN** the user returns to conversation A's chat detail page
- **THEN** RN MUST keep the hidden revoked-message placeholders out of the visible timeline
- **AND** RN MUST show the shortcut-to-latest arrow
- **AND** RN MUST NOT show the `x条新消息` count text
- **WHEN** the user taps the shortcut-to-latest arrow
- **THEN** RN MUST reveal the corresponding revoked-message placeholders such as `此消息已撤回`
