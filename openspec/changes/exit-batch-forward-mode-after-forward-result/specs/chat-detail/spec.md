## MODIFIED Requirements

### Requirement: Batch forward exits chat multi-select state after result

After the user starts batch forward from chat multi-select mode, the source chat page MUST exit multi-select mode when the forward flow returns after either success or failure.

#### Scenario: Batch forward succeeds

- **WHEN** the user starts serial forward or merged forward from chat multi-select mode
- **AND** the forward flow completes successfully and returns to the source chat page
- **THEN** the source chat page exits multi-select mode
- **AND** the selected message set is cleared

#### Scenario: Batch forward fails

- **WHEN** the user starts serial forward or merged forward from chat multi-select mode
- **AND** the forward flow fails and returns to the source chat page
- **THEN** the source chat page exits multi-select mode
- **AND** the selected message set is cleared

#### Scenario: Single-message forward returns

- **WHEN** the user opens the forward flow from a single-message action
- **THEN** returning from that forward flow does not trigger batch multi-select cleanup logic
