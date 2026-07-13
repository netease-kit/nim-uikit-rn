## MODIFIED Requirements

### Requirement: Recall And Local Delete Behavior

The chat module SHALL support recall and local delete behaviors with the test-defined time limits, re-edit flows, list-preview updates, offline outcomes, and cross-endpoint synchronization.

#### Scenario: Deleting selected messages in multi-select mode

- **WHEN** the user deletes one or more already-selected messages from multi-select mode
- **THEN** the app applies the delete immediately
- **AND** the app MUST preserve the existing delete failure handling
- **AND** the multi-select delete flow MUST NOT require an extra confirmation dialog unless a workbook testcase explicitly adds one
