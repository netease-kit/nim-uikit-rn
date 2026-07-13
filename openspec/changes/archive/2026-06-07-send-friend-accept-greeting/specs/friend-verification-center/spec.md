## MODIFIED Requirements

### Requirement: Verification State Transitions

The verification center SHALL support accept, reject, read, clear-single, clear-all, and profile-entry operations for inbound verification records, SHALL filter records sent by the current account, SHALL preserve the correct status text for each visible record, and SHALL send the native-aligned greeting text to the applicant after an inbound friend application is accepted successfully.

#### Scenario: Accepting or rejecting an application

- **WHEN** the user acts on a verification record
- **THEN** the record state changes to the expected accepted or rejected presentation

#### Scenario: Sending greeting after accepting an inbound friend application

- **GIVEN** the verification center shows an inbound pending friend application
- **WHEN** the user taps agree and the SDK accepts the application successfully
- **THEN** RN sends a P2P text message to the applicant
- **AND** the text content is localized as the native greeting `我已经同意了你的申请，现在开始聊天吧~` in Chinese
- **AND** the greeting send uses the normal chat message send path so the chat timeline and conversation preview update consistently
- **AND** a greeting send failure does not roll back the accepted verification state
