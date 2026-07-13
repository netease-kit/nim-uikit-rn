## MODIFIED Requirements

### Requirement: Multi-Select Entry And Limits

The chat module SHALL provide message multi-select mode with enter, exit, cancel, selection-count limits, and message-type eligibility rules required by the tests. Multi-select message deletion SHALL support deleting up to 50 selected messages in one action, SHALL reject only selections greater than 50, and SHALL use a batch deletion path so deleting many messages does not wait on one remote deletion request per message. The selected-message count SHALL be derived from unique visible message keys so duplicate local message rows do not inflate the count used by the delete-limit check. Chat multi-select mode SHALL NOT support per-message resend, including active failed-message retry affordances, but SHALL keep failed-message state indicators visible.

#### Scenario: Failed message resend is unavailable in multi-select mode

- **GIVEN** the user is in chat multi-select mode
- **AND** the timeline contains a failed message from the current user
- **WHEN** the user taps the failed message row or its failed-state indicator
- **THEN** RN MUST toggle message selection only
- **AND** RN MUST NOT resend the failed message
- **AND** RN MUST render the failed-message exclamation indicator as a visual state cue
- **AND** RN MUST NOT render an active failed-message retry affordance in multi-select mode
