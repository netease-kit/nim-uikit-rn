## MODIFIED Requirements

### Requirement: Chat Detail Must Load Complete History Pages

The chat detail screen SHALL load history messages with pagination parameters aligned to the native implementations so that older messages are not skipped across page boundaries.

#### Scenario: Opening a chat with existing history

- **WHEN** the user opens a conversation with server-side history
- **THEN** the initial history request MUST load the native-aligned default page size
- **AND** the latest page of messages MUST remain ordered from older to newer in the RN message store

#### Scenario: Loading earlier messages by scrolling upward

- **WHEN** the user continues scrolling upward to request older messages
- **THEN** RN MUST request history with both the earliest loaded message as the anchor and that message time as the pagination boundary
- **AND** the next page MUST merge into the local message list without skipping messages at the page boundary
