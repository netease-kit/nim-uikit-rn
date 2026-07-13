## ADDED Requirements

### Requirement: Merged Forward Summary Sender Truncation

The chat module SHALL render sender nicknames in merged-forward message card summaries as a one-line prefix that uses no more than 40% of the summary row width and truncates overflow with an ellipsis.

#### Scenario: Long sender nickname in merged-forward summary

- **WHEN** a merged-forward message card summary row contains a sender nickname longer than 40% of the available summary row width
- **THEN** the sender nickname MUST occupy at most 40% of that row width
- **AND** the sender nickname MUST render on one line
- **AND** overflowing nickname text MUST be truncated with an ellipsis
- **AND** the summary content after the nickname MUST remain visible in the remaining row width
