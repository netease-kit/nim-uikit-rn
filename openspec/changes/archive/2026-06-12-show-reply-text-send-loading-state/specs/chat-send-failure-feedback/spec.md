## ADDED Requirements

### Requirement: Reply text messages must expose a visible sending state

Outgoing reply text messages MUST display a visible sending indicator while the send result has not been finalized.

#### Scenario: Reply text message still sending

- **GIVEN** the user sends a reply text message
- **AND** the message send state is still in progress
- **WHEN** the message bubble is rendered in chat detail
- **THEN** the bubble must show a visible sending indicator

#### Scenario: Reply text message later fails after offline send attempt

- **GIVEN** the user sends a reply text message while the network is unavailable
- **AND** the message initially remains in the sending state before the final result returns
- **WHEN** the final send result is not successful
- **THEN** the bubble must keep the sending indicator until failure is confirmed
- **AND** only then transition to the failed state UI
