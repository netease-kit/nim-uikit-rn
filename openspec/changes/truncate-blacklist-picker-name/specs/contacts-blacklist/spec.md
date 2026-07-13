## MODIFIED Requirements

### Requirement: Blacklist Picker Name Truncation

The app SHALL keep blacklist-picker rows visually stable when a friend nickname is long.

#### Scenario: Render a long friend nickname in blacklist picker

- **WHEN** a friend nickname exceeds the available width in the blacklist-picker row
- **THEN** the nickname MUST render on a single line
- **AND** overflow MUST be truncated with a tail ellipsis
