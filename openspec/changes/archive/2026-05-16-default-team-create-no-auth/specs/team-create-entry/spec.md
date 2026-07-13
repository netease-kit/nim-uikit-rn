## MODIFIED Requirements

### Requirement: Team Type And Initial Chat Presentation

The creation flow SHALL preserve whether the user is creating a discussion-style group or advanced team, SHALL create new teams with invitee approval disabled by default, and SHALL render the resulting chat page with the expected system notification row and initial metadata.

#### Scenario: Opening a newly created team chat

- **WHEN** creation succeeds for a supported team type
- **THEN** the resulting chat page shows the expected title and creation notification content

#### Scenario: Default invitee approval mode for new teams

- **WHEN** the user creates a new team from the supported creation flow
- **THEN** the created team uses `不需要被邀请者同意` as the default invitee approval mode
