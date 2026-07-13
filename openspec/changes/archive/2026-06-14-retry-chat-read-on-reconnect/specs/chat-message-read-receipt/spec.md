## MODIFIED Requirements

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
