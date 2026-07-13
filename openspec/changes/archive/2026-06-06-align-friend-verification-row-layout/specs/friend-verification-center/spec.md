## ADDED Requirements

### Requirement: Friend Verification Row Layout

The contacts verification-message list SHALL render inbound friend applications with a stable two-line identity layout and complete action buttons.

#### Scenario: Show inbound friend request with complete actions

- **WHEN** the current account receives an unhandled friend add application
- **THEN** RN MUST show the applicant avatar on the left
- **AND** RN MUST show the applicant display name on the first text line
- **AND** RN MUST truncate the first line with an ellipsis when the display name exceeds available width
- **AND** RN MUST show the friend-request action text on the second text line
- **AND** RN MUST keep compact reject and agree buttons fully visible
