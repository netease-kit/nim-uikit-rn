## ADDED Requirements

### Requirement: Chat send failure uses inline feedback only

The chat experience SHALL use inline failure feedback only when an outgoing send or resend attempt fails from the chat detail flow.

#### Scenario: Sending a chat message fails

- **WHEN** an outgoing message send fails from the chat detail page or location send page
- **THEN** the failed message MUST remain in the timeline with send-failed state when the message draft has already been inserted
- **AND** any store-generated tips message for that failure MAY still be appended to the timeline
- **AND** the page MUST NOT show an additional send-failure or resend-failure alert dialog for that failure
