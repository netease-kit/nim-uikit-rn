## ADDED Requirements

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
