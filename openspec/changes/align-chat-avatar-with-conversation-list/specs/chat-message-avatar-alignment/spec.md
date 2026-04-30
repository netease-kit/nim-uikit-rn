## ADDED Requirements

### Requirement: Chat detail avatars match conversation-list presentation
The system SHALL render message avatars in the chat detail page using the same visible avatar size and wrapper spacing baseline as the conversation list UIKit row.

#### Scenario: Incoming message avatar uses conversation-list sizing
- **WHEN** the chat detail page renders an incoming message bubble with an avatar
- **THEN** the avatar visible size MUST match the conversation list avatar size
- **AND** the avatar wrapper width and horizontal spacing MUST align with the conversation list baseline

#### Scenario: Outgoing message avatar uses conversation-list sizing
- **WHEN** the chat detail page renders an outgoing message bubble with an avatar
- **THEN** the avatar visible size MUST match the conversation list avatar size
- **AND** the avatar wrapper width and horizontal spacing MUST align with the conversation list baseline

#### Scenario: Avatar wrapper does not introduce extra visual offset
- **WHEN** the chat detail page renders message avatars
- **THEN** the avatar wrapper MUST NOT add a conflicting placeholder background or smaller fixed box that shifts avatar alignment relative to the conversation list style
