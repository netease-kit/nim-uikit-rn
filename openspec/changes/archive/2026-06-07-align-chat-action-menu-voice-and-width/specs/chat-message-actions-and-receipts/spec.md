## MODIFIED Requirements

### Requirement: Message Action Panel

The chat module SHALL expose the long-press or action-panel operations required by the tests, including copy, reply, resend, revoke, delete, pin or mark, and collect behaviors, SHALL vary the visible actions by message type and state, SHALL allow eligible voice messages to be pinned and collected even when they cannot be forwarded, SHALL size the action panel to the visible action count when fewer than the maximum columns are shown, and SHALL dismiss the action panel before showing a follow-up destructive confirmation dialog.

#### Scenario: Long-pressing a link inside a text message

- **GIVEN** the chat detail page renders a sent or received text message containing a webpage link
- **WHEN** the user long-presses the link text inside the message bubble
- **THEN** the app MUST show the existing message operation panel for that message
- **AND** it MUST NOT open the link in the browser from the long-press gesture

#### Scenario: Voice message action availability

- **GIVEN** the chat detail page renders an eligible voice message
- **WHEN** the user long-presses the voice message
- **THEN** the action panel MUST show Pin or Unpin
- **AND** the action panel MUST show Collect or Remove from collection
- **AND** the action panel MUST keep Forward hidden when voice forwarding is unsupported

#### Scenario: Adaptive action panel width for few actions

- **GIVEN** a sending or failed message has only two or three visible long-press actions
- **WHEN** the user long-presses the message
- **THEN** the action panel width MUST fit the visible actions instead of using the full five-column width
