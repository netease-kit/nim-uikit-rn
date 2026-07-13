## ADDED Requirements

### Requirement: Cross-Device Message Collection Visibility

The collection page SHALL display message collections created by RN, Android, and iOS clients for the current account.

#### Scenario: Native-created collection appears in RN collection list

- **GIVEN** a message was collected on Android or iOS using the native message collection format
- **WHEN** the user opens My > Collection in RN
- **THEN** RN MUST query collections across all message collection types
- **AND** RN MUST parse the native collection payload
- **AND** RN MUST render the collected message in the collection list when the serialized message can be deserialized

#### Scenario: Legacy RN collection remains visible

- **GIVEN** a message was collected by an older RN build using the RN collection payload format
- **WHEN** the user opens My > Collection in RN
- **THEN** RN MUST continue to show that collection by resolving the stored message reference or stored preview
