## ADDED Requirements

### Requirement: Member nickname pages reuse UIKit appellation logic
The system SHALL derive user-facing member names in member-centric pages from the same UIKit appellation logic used by the conversation list.

#### Scenario: Read-detail page uses UIKit appellation
- **WHEN** `/chat/read-detail` renders a read or unread member row
- **THEN** the displayed nickname MUST come from the UIKit appellation resolver for that account and team context

#### Scenario: Team member pages use UIKit appellation
- **WHEN** team member list or team settings preview renders a member nickname
- **THEN** the displayed nickname MUST come from the UIKit appellation resolver for that account and team context

#### Scenario: Chat history sender names use UIKit appellation
- **WHEN** chat history renders a sender name for a non-self message
- **THEN** the displayed nickname MUST come from the UIKit appellation resolver for that account and optional team context

#### Scenario: P2P profile-like pages use UIKit appellation
- **WHEN** a p2p settings or forwarding flow renders a user-facing counterpart nickname
- **THEN** the displayed nickname MUST come from the UIKit appellation resolver for that account
