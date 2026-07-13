## ADDED Requirements

### Requirement: Audio message duration uses millisecond attachment values

RN chat voice messages SHALL write attachment duration values in milliseconds so Android and RN render the same spoken length.

#### Scenario: Sending a recorded voice message from RN

- **WHEN** the user records and sends a voice message from the RN chat detail page
- **THEN** the outgoing audio attachment MUST store `duration` in milliseconds
- **AND** Android clients that render voice duration by dividing attachment duration by `1000` MUST show the correct spoken length instead of collapsing to `1s`
