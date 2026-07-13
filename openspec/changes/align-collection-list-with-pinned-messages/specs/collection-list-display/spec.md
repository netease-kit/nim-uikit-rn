## ADDED Requirements

### Requirement: Collection message list must align with pinned-message list presentation

The RN collection page MUST present collected messages using the same card-shell layout pattern as the pinned-message list.

#### Scenario: Viewing collected messages

- **WHEN** the user opens the collection page
- **THEN** each collection item uses the pinned-message list card shell style
- **AND** each item shows a header, divider, and message preview area aligned with the pinned-message list
- **AND** collection-specific source and action controls remain available
