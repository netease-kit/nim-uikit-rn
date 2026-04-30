## ADDED Requirements

### Requirement: Verification List And Unread Count

The app SHALL expose the friend verification list, unread count, sorting order, no-new-message state, and initial-load failure recovery required by the tests.

#### Scenario: Receiving verification messages

- **WHEN** new verification events arrive online or during sync
- **THEN** the unread count and verification list update to reflect the latest event order

#### Scenario: Opening verification center when initial load fails

- **WHEN** the verification center cannot finish its initial data load
- **THEN** the page distinguishes that failure from an actually empty list and provides a retry action

### Requirement: Verification State Transitions

The verification center SHALL support accept, reject, read, clear-single, and clear-all operations, and SHALL preserve the correct status text for each record.

#### Scenario: Accepting or rejecting an application

- **WHEN** the user acts on a verification record
- **THEN** the record state changes to the expected accepted or rejected presentation

#### Scenario: Clearing verification unread state

- **WHEN** the user clears a single verification unread flag or clears all verification messages
- **THEN** the unread badge and list state update according to the tests

### Requirement: Duplicate, Timeout, And Display Refresh Handling

The verification center SHALL merge duplicate events, represent expired or long-pending verification records, and refresh alias or nickname display when the underlying contact data changes.

#### Scenario: Receiving duplicate verification events

- **WHEN** multiple events belong to the same verification relationship
- **THEN** the visible list keeps the required merged or latest-state behavior

#### Scenario: Rendering old or updated verification rows

- **WHEN** a verification row becomes older than the test threshold or the sender's display name changes
- **THEN** the row shows the expected status text and latest display name

### Requirement: Offline And Multi-Endpoint Consistency

The verification center SHALL follow the workbook rules for offline receipt, reconnect recovery, and cross-endpoint divergence when separate devices act on the same verification record.

#### Scenario: Syncing verification actions across endpoints

- **WHEN** different endpoints accept, reject, or read the same verification relationship
- **THEN** the current endpoint reflects the test-defined final status and unread outcome
