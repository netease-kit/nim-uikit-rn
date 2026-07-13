## MODIFIED Requirements

### Requirement: Active Chat Incoming Messages Send Read Receipts

The chat detail flow SHALL send message read receipts as soon as the app receives new incoming messages for the currently active P2P or team chat. A chat is considered active for sending incoming-message read receipts only while its chat detail route is focused, the app is in the foreground `active` state, and the user is viewing the latest-message area rather than browsing historical messages.

#### Scenario: Peer receives while user is in chat

- **WHEN** the current user is viewing a focused P2P or team chat detail page while the app is foreground active
- **AND** another participant sends a new message to that conversation
- **THEN** the app MUST send the appropriate read receipt for the incoming message
- **AND** the sender MUST be able to see that message become read without waiting for the current user to type or send another message

#### Scenario: Incoming message while chat is not visibly active

- **GIVEN** the user was previously viewing conversation A
- **WHEN** the app is in the background, or the user has navigated from conversation A to its settings page or read/unread member detail page
- **AND** conversation A receives a new message
- **THEN** RN MUST NOT send a read receipt for that newly received message

#### Scenario: Returning to chat sends pending read receipts

- **GIVEN** conversation A received a new message while its chat detail page was not visibly active
- **WHEN** the user returns to conversation A's focused chat detail page while the app is foreground active
- **THEN** RN MUST send the appropriate read receipt for the pending incoming message

#### Scenario: Incoming message while browsing history

- **GIVEN** the user is on conversation A's focused chat detail page while the app is foreground active
- **AND** the user has scrolled away from the latest-message area to view historical messages
- **WHEN** conversation A receives a new message
- **THEN** RN MUST NOT send a read receipt for that newly received message
- **AND** RN MUST keep the new-message reminder available

#### Scenario: Returning to latest-message area sends pending read receipts

- **GIVEN** conversation A received a new message while the user was browsing historical messages
- **WHEN** the user scrolls or taps the new-message reminder to return to the latest-message area
- **THEN** RN MUST send the appropriate read receipt for the pending incoming message
- **AND** RN MUST clear conversation A's unread count so the conversation list avatar no longer shows that unread badge
