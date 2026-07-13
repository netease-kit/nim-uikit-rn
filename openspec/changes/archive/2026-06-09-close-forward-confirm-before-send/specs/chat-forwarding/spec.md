## MODIFIED Requirements

### Requirement: Forward Confirmation Responsiveness

The forwarding flow SHALL close the confirmation modal and return to the source flow immediately after pre-send validation succeeds, without waiting for all forwarding send operations to finish.

#### Scenario: Serial forwarding multiple messages to multiple targets closes promptly

- **GIVEN** the user selects multiple messages for one-by-one forwarding
- **AND** the user selects one or more forwarding targets
- **WHEN** the user confirms sending in the forwarding confirmation modal
- **THEN** RN MUST validate target selection, supported message content, nested-forward constraints, and network availability before starting the send
- **AND** after validation succeeds RN MUST close the confirmation modal promptly
- **AND** RN MUST return to the source page without waiting for every forwarded message send operation to complete
- **AND** RN MUST continue sending the forwarded messages in the background

#### Scenario: Merged forwarding to multiple targets closes promptly

- **GIVEN** the user selects multiple messages for merged forwarding
- **AND** the user selects one or more forwarding targets
- **WHEN** the user confirms sending in the forwarding confirmation modal
- **THEN** RN MUST validate target selection, supported message content, nested-forward constraints, and network availability before starting the send
- **AND** after validation succeeds RN MUST close the confirmation modal promptly
- **AND** RN MUST return to the source page without waiting for every merged-forward send operation to complete
- **AND** RN MUST continue sending the merged-forward messages in the background
