## MODIFIED Requirements

### Requirement: Multi-Select Entry And Limits

The chat module SHALL provide message multi-select mode with enter, exit, cancel, selection-count limits, and message-type eligibility rules required by the tests. Multi-select message deletion SHALL support deleting up to 50 selected messages in one action, SHALL reject only selections greater than 50, and SHALL use a batch deletion path so deleting many messages does not wait on one remote deletion request per message. The selected-message count SHALL be derived from unique visible message keys so duplicate local message rows do not inflate the count used by the delete-limit check. Chat multi-select mode SHALL NOT support per-message resend, including active failed-message retry affordances, but SHALL keep failed-message state indicators visible. In multi-select mode, only tapping the message bubble body itself SHALL toggle message selection; tapping other message-row subregions or child affordances SHALL have no effect.

#### Scenario: Failed message resend is unavailable in multi-select mode

- **GIVEN** the user is in chat multi-select mode
- **AND** the timeline contains a failed message from the current user
- **WHEN** the user taps the failed message row or its failed-state indicator
- **THEN** RN MUST toggle message selection only when the message bubble body itself is tapped
- **AND** tapping the failed-state indicator MUST have no effect
- **AND** RN MUST NOT resend the failed message
- **AND** RN MUST render the failed-message exclamation indicator as a visual state cue
- **AND** RN MUST NOT render an active failed-message retry affordance in multi-select mode

#### Scenario: Non-bubble affordances stay inactive in multi-select mode

- **GIVEN** the user is in chat multi-select mode
- **WHEN** the user taps a message avatar, reply reference area, rich-text link, friend-verification link, or read-receipt area
- **THEN** RN MUST NOT navigate, open detail, open link, or trigger any secondary action
- **AND** RN MUST NOT toggle message selection from those non-bubble subregions
- **AND** only tapping the message bubble body itself MAY toggle the selected state
