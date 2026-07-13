## MODIFIED Requirements

### Requirement: Verification State Transitions

The verification center SHALL support accept, reject, read, clear-single, and clear-all operations, and SHALL preserve the correct status text for each record.

#### Scenario: Clearing verification unread state

- **WHEN** the user clears a single verification unread flag or clears all verification messages
- **THEN** the unread badge and list state update according to the tests
- **AND** the clear-all action MUST NOT require an extra confirmation dialog unless a workbook testcase explicitly adds one
