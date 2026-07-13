## MODIFIED Requirements

### Requirement: Chat send failure uses inline feedback only

The chat experience SHALL use inline failure feedback only when an outgoing send or resend attempt fails from the chat detail flow.

#### Scenario: Sending a chat message fails

- **WHEN** an outgoing message send fails from the chat detail page or location send page
- **THEN** the failed message MUST remain in the timeline with send-failed state when the message draft has already been inserted
- **AND** any failure reason bound to that message MUST render inline with the same failed message instead of in a detached failure row
- **AND** the page MUST NOT show an additional send-failure or resend-failure alert dialog for that failure

#### Scenario: Multiple anti-spam media failures stay attached to their own messages

- **GIVEN** the user selects and sends multiple images from the chat detail media picker
- **AND** more than one selected image is blocked by anti-spam
- **WHEN** RN renders the failed outgoing image messages in the timeline
- **THEN** each anti-spam failure copy MUST appear directly with its own failed image message
- **AND** RN MUST NOT append a separate anti-spam tips row whose order can drift from the failed message order
