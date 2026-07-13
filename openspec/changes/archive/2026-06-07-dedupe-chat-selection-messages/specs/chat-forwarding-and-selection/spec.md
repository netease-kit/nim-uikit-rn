## MODIFIED Requirements

### Requirement: Multi-Select Entry And Limits

The chat module SHALL provide message multi-select mode with enter, exit, cancel, selection-count limits, and message-type eligibility rules required by the tests. Multi-select message deletion SHALL support deleting up to 50 selected messages in one action, SHALL reject only selections greater than 50, and SHALL use a batch deletion path so deleting many messages does not wait on one remote deletion request per message. The selected-message count SHALL be derived from unique visible message keys so duplicate local message rows do not inflate the count used by the delete-limit check.

#### Scenario: Selecting messages in multi-select mode

- **WHEN** the user enters multi-select mode and selects or deselects eligible messages
- **THEN** the selection state, toolbar actions, and count limits follow the workbook rules

#### Scenario: Deleting 50 selected messages

- **GIVEN** the user has selected 50 deletable messages in chat multi-select mode
- **WHEN** the user confirms deletion
- **THEN** the app MUST send the selected messages through a batch deletion path
- **AND** the app MUST exit multi-select mode after the batch delete action succeeds
- **AND** the app MUST NOT reject the action as exceeding the delete limit

#### Scenario: Rejecting too many selected messages for deletion

- **GIVEN** the user has selected more than 50 messages in chat multi-select mode
- **WHEN** the user taps delete
- **THEN** the app MUST reject the delete action with the configured delete-limit tip
- **AND** the app MUST keep the user in multi-select mode

#### Scenario: Counting duplicate local message rows once

- **GIVEN** the local chat timeline contains duplicate rows with the same message key
- **WHEN** the user selects messages in multi-select mode
- **THEN** the selected-message count used by the header and delete-limit check MUST count each message key at most once
- **AND** selecting 50 unique message keys MUST NOT trigger the delete-limit tip
