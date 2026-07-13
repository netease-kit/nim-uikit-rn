## ADDED Requirements

### Requirement: Forward Picker Uses Cloud Conversations

The system SHALL use the active cloud conversation list as the forward picker's recent chat source when cloud conversations are enabled. The picker SHALL NOT mix local conversations into recent chats in cloud conversation mode.

#### Scenario: Cloud conversation mode recent chats

- **WHEN** cloud conversations are enabled and the user opens the forward target picker
- **THEN** the recent chat list is built from the cloud conversation list

#### Scenario: Local conversation mode recent chats

- **WHEN** cloud conversations are disabled and the user opens the forward target picker
- **THEN** the recent chat list continues to use local conversation data

### Requirement: Forwarding Does Not Create Local Conversations In Cloud Mode

The system SHALL NOT create local conversations as a forwarding side effect when cloud conversations are enabled.

#### Scenario: Forward to cloud conversation target

- **WHEN** cloud conversations are enabled and the user confirms a forward target
- **THEN** forwarding proceeds without creating a local conversation record for that target
