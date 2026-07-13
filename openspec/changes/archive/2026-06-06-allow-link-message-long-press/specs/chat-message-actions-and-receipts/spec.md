## MODIFIED Requirements

### Requirement: Message Action Panel

The chat module SHALL expose the long-press or action-panel operations required by the tests, including copy, reply, resend, revoke, delete, and pin or mark behaviors, and SHALL vary the visible actions by message type and state.

#### Scenario: Long-pressing a link inside a text message

- **GIVEN** the chat detail page renders a sent or received text message containing a webpage link
- **WHEN** the user long-presses the link text inside the message bubble
- **THEN** the app MUST show the existing message operation panel for that message
- **AND** it MUST NOT open the link in the browser from the long-press gesture

#### Scenario: Tapping a link inside a text message

- **GIVEN** the chat detail page renders a text message containing a webpage link
- **WHEN** the user taps the link text
- **THEN** the app MUST keep the existing behavior of opening the link
