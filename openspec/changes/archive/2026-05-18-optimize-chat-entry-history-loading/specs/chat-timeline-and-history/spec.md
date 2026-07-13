## MODIFIED Requirements

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
