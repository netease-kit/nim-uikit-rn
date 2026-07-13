# friend-verification-center Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

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

### Requirement: Verification State Transitions

The verification center SHALL support accept, reject, read, clear-single, clear-all, and profile-entry operations for inbound verification records, SHALL filter records sent by the current account, SHALL preserve the correct status text for each visible record, and SHALL send the native-aligned greeting text to the applicant after an inbound friend application is accepted successfully.

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

#### Scenario: Sending greeting after accepting an inbound friend application

- **GIVEN** the verification center shows an inbound pending friend application
- **WHEN** the user taps agree and the SDK accepts the application successfully
- **THEN** RN sends a P2P text message to the applicant
- **AND** the text content is localized as the native greeting `我已经同意了你的申请，现在开始聊天吧~` in Chinese
- **AND** the greeting send uses the normal chat message send path so the chat timeline and conversation preview update consistently
- **AND** a greeting send failure does not roll back the accepted verification state

### Requirement: Duplicate, Timeout, And Display Refresh Handling

The verification center SHALL merge duplicate events, represent expired or long-pending verification records, and refresh alias or nickname display when the underlying contact data changes.

#### Scenario: Receiving duplicate verification events

- **WHEN** multiple events belong to the same verification relationship
- **THEN** the visible list keeps the required merged or latest-state behavior

#### Scenario: Rendering old or updated verification rows

- **WHEN** a verification row becomes older than the test threshold or the sender's display name changes
- **THEN** the row shows the expected status text and latest display name

### Requirement: Offline And Multi-Endpoint Consistency

The verification center SHALL follow the workbook rules for offline receipt, reconnect recovery, and cross-endpoint divergence when separate devices act on the same verification record.

#### Scenario: Syncing verification actions across endpoints

- **WHEN** different endpoints accept, reject, or read the same verification relationship
- **THEN** the current endpoint reflects the test-defined final status and unread outcome

### Requirement: Friend Verification Row Layout

The contacts verification-message list SHALL render inbound friend applications with a stable two-line identity layout and complete action buttons.

#### Scenario: Show inbound friend request with complete actions

- **WHEN** the current account receives an unhandled friend add application
- **THEN** RN MUST show the applicant avatar on the left
- **AND** RN MUST show the applicant display name on the first text line
- **AND** RN MUST truncate the first line with an ellipsis when the display name exceeds available width
- **AND** RN MUST show the friend-request action text on the second text line
- **AND** RN MUST keep compact reject and agree buttons fully visible

### Requirement: Offline Verification Action Feedback

The verification center SHALL show the localized network-unavailable message for inbound agree or reject actions attempted while the device is offline, and SHALL NOT expose raw SDK `illegal state` text to the user.

#### Scenario: Agreeing while offline

- **GIVEN** the device is offline and the verification center shows an inbound pending friend application
- **WHEN** the user taps agree
- **THEN** the app shows the localized network-unavailable message
- **AND** the verification record remains pending
- **AND** the user does not see raw SDK `illegal state` text

#### Scenario: Rejecting while offline

- **GIVEN** the device is offline and the verification center shows an inbound pending friend application
- **WHEN** the user taps reject
- **THEN** the app shows the localized network-unavailable message
- **AND** the verification record remains pending
- **AND** the user does not see raw SDK `illegal state` text

### Requirement: Local-First Verification Clear

The verification center SHALL clear the currently visible verification records without requiring network connectivity, SHALL provide success feedback after the local clear completes, and SHALL keep cleared historical records hidden on later refreshes until newer verification records arrive.

#### Scenario: Clearing verification messages while offline

- **GIVEN** the verification center shows one or more verification records and the device is offline
- **WHEN** the user taps clear
- **THEN** the visible verification list is cleared immediately
- **AND** the app shows success feedback for the clear action
- **AND** the operation does not fail only because the network is unavailable

#### Scenario: Refreshing after a local clear

- **GIVEN** the user has already cleared the visible verification records
- **WHEN** the app later refreshes friend verification history
- **THEN** verification records at or before the clear point remain hidden
- **AND** only newer verification records can appear again
