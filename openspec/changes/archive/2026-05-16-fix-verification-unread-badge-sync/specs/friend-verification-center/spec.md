## MODIFIED Requirements

### Requirement: Verification List And Unread Count

The app SHALL expose the friend verification list, unread count, sorting order, no-new-message state, and initial-load failure recovery required by the tests.

#### Scenario: Receiving verification messages

- **WHEN** new verification events arrive online or during sync
- **THEN** the unread count and verification list update to reflect the latest event order

#### Scenario: Opening verification center when initial load fails

- **WHEN** the verification center cannot finish its initial data load
- **THEN** the page distinguishes that failure from an actually empty list and provides a retry action

#### Scenario: Counting repeated unread applications from one applicant

- **WHEN** the same applicant has multiple unread pending friend verification records
- **THEN** the unread badge counts that applicant as one unread unit until the current account reads or handles the applications

#### Scenario: Rendering repeated applications from one applicant

- **WHEN** the same applicant has multiple friend verification records visible to the current account
- **THEN** the verification list renders one visible row for that applicant
- **AND** the row prefers that applicant's unread pending record when one exists
- **AND** otherwise the row reflects the latest record for that applicant

#### Scenario: Recovering unread verification state after offline login

- **WHEN** friend verification applications arrive while the current account is offline
- **AND** the current account logs back in later
- **THEN** the Contacts unread badge and verification entry count recover after the login refresh flow completes
