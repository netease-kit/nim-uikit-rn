## MODIFIED Requirements

### Requirement: Chat multi-select checkbox stays at the left edge

In chat multi-select mode, the selection checkbox MUST stay on the left side of the message row for both incoming and outgoing messages.

#### Scenario: Outgoing message is selected in multi-select mode

- **WHEN** the user enters chat multi-select mode
- **AND** an outgoing message row is rendered
- **THEN** its selection checkbox is displayed at the left side of the row
- **AND** the outgoing message bubble remains right-aligned within the remaining content area

#### Scenario: Multi-select action bar is shown

- **WHEN** the user enters chat multi-select mode
- **THEN** the bottom multi-select action bar reserves the device safe-area inset at the bottom
