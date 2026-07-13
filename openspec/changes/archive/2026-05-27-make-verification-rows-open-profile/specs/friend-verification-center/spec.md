## MODIFIED Requirements

### Requirement: Verification State Transitions

The verification center SHALL support accept, reject, read, clear-single, clear-all, and profile-entry operations for inbound verification records, SHALL filter records sent by the current account, and SHALL preserve the correct status text for each visible record.

#### Scenario: Accepting or rejecting an application

- **WHEN** the user acts on a verification record
- **THEN** the record state changes to the expected accepted or rejected presentation

#### Scenario: Opening the peer profile from a verification record

- **GIVEN** the verification center shows a friend application record
- **WHEN** the user taps the account area of that record
- **THEN** the app opens the peer account profile card
- **AND** the peer account is the applicant account for visible inbound records

#### Scenario: Filtering applications sent by the current user

- **GIVEN** friend application records include records where the current account is `applicantAccountId`
- **WHEN** the verification center renders the list
- **THEN** those self-sent records are not displayed
- **AND** they do not contribute to the verification unread badge

#### Scenario: Showing pending verification count on Contacts

- **GIVEN** the current account receives one or more unread inbound pending friend applications
- **WHEN** the Contacts page renders the verification shortcut
- **THEN** the shortcut shows the corresponding pending verification count after the verification-message label
- **AND** self-sent applications do not contribute to that count

#### Scenario: Clearing pending verification count from Contacts

- **GIVEN** the Contacts page shows a pending verification count on the verification shortcut
- **WHEN** the user taps the verification shortcut
- **THEN** the app clears the visible pending verification count before or while opening the verification center
- **AND** the verification applications are marked read for subsequent refreshes

#### Scenario: Keeping processed inbound verification records visible

- **GIVEN** friend application records include inbound records where the current account is `recipientAccountId`
- **WHEN** those records are already agreed, rejected, expired, or otherwise processed
- **THEN** the verification center continues to display those inbound records with their status text

#### Scenario: Pending inbound action buttons remain actionable

- **GIVEN** the verification center shows an inbound pending friend application
- **WHEN** the user taps agree or reject
- **THEN** the app performs that action without requiring profile navigation first

#### Scenario: Clearing verification unread state

- **WHEN** the user clears a single verification unread flag or clears all verification messages
- **THEN** the unread badge and list state update according to the tests
