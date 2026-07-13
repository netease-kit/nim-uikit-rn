## ADDED Requirements

### Requirement: History Pagination Must Not Skip Interleaved Messages

The chat module SHALL keep upward history pagination aligned with the Android and iOS native implementations, and repeated upward pagination SHALL NOT skip older messages because of local anchor resets or unstable message merging.

#### Scenario: Loading earlier messages across multiple pages

- **WHEN** the user keeps scrolling upward to load multiple pages of older history
- **THEN** RN MUST request history with the earliest loaded message as the anchor and that message time as the pagination boundary
- **AND** the stored history anchor MUST only move toward older messages instead of being reset to a newer page by later syncs

#### Scenario: Merging historical messages with partial message identifiers

- **WHEN** RN merges historical pages that contain messages missing either `messageClientId` or `messageServerId`
- **THEN** the local merge logic MUST still preserve distinct messages instead of collapsing them into one entry
- **AND** the rendered chat history MUST remain ordered from older to newer without interleaved gaps
