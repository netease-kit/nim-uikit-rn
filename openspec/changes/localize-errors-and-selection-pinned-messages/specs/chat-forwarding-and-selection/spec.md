## MODIFIED Requirements

### Requirement: Multi-Select Entry And Limits

The chat module SHALL provide message multi-select mode with enter, exit, cancel, selection-count limits, and message-type eligibility rules required by the tests. Eligible messages that are currently marked or pinned SHALL still render a visible selection checkbox in multi-select mode.

#### Scenario: Selecting messages in multi-select mode

- **WHEN** the user enters multi-select mode and selects or deselects eligible messages
- **THEN** the selection state, toolbar actions, and count limits follow the workbook rules

#### Scenario: Marked message in multi-select mode

- **WHEN** the user enters multi-select mode while an eligible marked message is visible in the chat timeline
- **THEN** that marked message row MUST display the same visible selection checkbox affordance as other eligible messages
