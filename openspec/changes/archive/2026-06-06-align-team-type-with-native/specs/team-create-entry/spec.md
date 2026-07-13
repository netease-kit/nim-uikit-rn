## MODIFIED Requirements

### Requirement: Team Type And Initial Chat Presentation

The creation flow SHALL preserve whether the user is creating a discussion-style group or advanced team, SHALL create new teams with invitee approval disabled by default, SHALL create new teams with applicant join approval disabled by default, and SHALL render the resulting chat page with the expected system notification row and initial metadata.

#### Scenario: Created team type is recognized by native clients

- **WHEN** RN creates a discussion group
- **THEN** the created team uses the same SDK team type and discussion marker as Android and iOS native clients
- **AND** Android and iOS native clients recognize it as a discussion group
- **WHEN** RN creates an advanced group
- **THEN** the created team uses the same SDK team type as Android and iOS native clients
- **AND** RN does not write the discussion marker for the advanced group
