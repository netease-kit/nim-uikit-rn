## Modified Requirements

### Requirement: Forward Picker Uses Cloud Conversations

The system SHALL use the active cloud conversation list as the forward picker's recent chat source when cloud conversations are enabled. The picker SHALL NOT mix local conversations into recent chats in cloud conversation mode.

#### Scenario: Cloud conversation mode recent chats

- **WHEN** cloud conversations are enabled and the user opens the forward target picker
- **THEN** the recent chat list is built from the cloud conversation list

#### Scenario: Local conversation mode recent chats

- **WHEN** cloud conversations are disabled and the user opens the forward target picker
- **THEN** the recent chat list continues to use local conversation data

#### Scenario: Cloud conversation mode recent chats prefetch

- **GIVEN** cloud conversations are enabled
- **AND** the main conversation list has not loaded all historical conversations
- **WHEN** the user opens the forward target picker from a chat page and scrolls the Recent Chats tab toward the bottom
- **THEN** RN MUST prefetch the next cloud conversation page before the user reaches the end of the currently loaded recent chats
- **AND** newly loaded conversations MUST appear in the Recent Chats tab as selectable forwarding targets
- **AND** RN MUST NOT show a visible loading-more indicator for this prefetch
- **AND** RN MUST NOT require the user to return to the main conversation list and scroll it first
