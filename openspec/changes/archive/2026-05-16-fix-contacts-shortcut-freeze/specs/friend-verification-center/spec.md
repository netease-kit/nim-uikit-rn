## MODIFIED Requirements

### Requirement: Verification List And Unread Count

The app SHALL expose the friend verification list, unread count, sorting order, no-new-message state, and initial-load failure recovery required by the tests.

#### Scenario: Receiving verification messages

- **WHEN** new verification events arrive online or during sync
- **THEN** the unread count and verification list update to reflect the latest event order

#### Scenario: Opening verification center when initial load fails

- **WHEN** the verification center cannot finish its initial data load
- **THEN** the page distinguishes that failure from an actually empty list and provides a retry action

#### Scenario: Opening verification center from Contacts

- **WHEN** the user opens the verification center from the Contacts shortcut
- **THEN** the page completes a single initial-load pass for the current navigation entry
- **AND** the page remains interactive after the load settles
