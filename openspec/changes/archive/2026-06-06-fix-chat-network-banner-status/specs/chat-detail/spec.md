## ADDED Requirements

### Requirement: Chat detail banner follows IM connection state

The chat detail page SHALL avoid showing the network-unavailable banner when the current user is authenticated and the IM SDK reports logged-in and connected.

#### Scenario: iPhone can send messages while NetInfo reports unavailable

- **WHEN** the authenticated user opens a chat detail page on a physical iPhone
- **AND** the IM SDK login status is logged in and connected
- **AND** messages can be sent successfully
- **THEN** the chat detail page does not show the network-unavailable banner

#### Scenario: IM connection is not ready

- **WHEN** the authenticated user opens a chat detail page
- **AND** the IM SDK is logged out or still connecting
- **THEN** the chat detail page shows the existing offline or connecting banner copy
