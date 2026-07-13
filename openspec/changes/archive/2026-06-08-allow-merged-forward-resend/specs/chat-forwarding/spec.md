## ADDED Requirements

### Requirement: Failed Merged Forward Resend

The system SHALL allow users to resend failed standard merged-forward messages. Unknown custom messages that are not recognized as merged-forward messages SHALL remain unsupported for resend.

#### Scenario: Resend failed merged-forward message

- **WHEN** a user's merged-forward message is in the failed sending state
- **THEN** the user can trigger resend and the message is sent again as a merged-forward message

#### Scenario: Unknown custom message resend remains unsupported

- **WHEN** a failed custom message is not recognized as a merged-forward message
- **THEN** resend remains unsupported for that message
