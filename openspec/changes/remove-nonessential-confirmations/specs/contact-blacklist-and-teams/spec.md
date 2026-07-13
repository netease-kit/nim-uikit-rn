## MODIFIED Requirements

### Requirement: Blacklist Management

The contacts module SHALL expose the blacklist list, blacklist empty state, row sorting, display-name precedence, add/remove blacklist actions, initial-load failure recovery with network-aware behavior, and the shared no-avatar fallback label order for blacklisted friends.

#### Scenario: Managing blacklist membership

- **WHEN** the user adds or removes a blacklist relation
- **THEN** the blacklist list and related friend surfaces refresh to the latest state
- **AND** removing a blacklist relation from the list MUST NOT require an extra confirmation dialog unless a workbook testcase explicitly adds one
