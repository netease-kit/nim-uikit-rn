## MODIFIED Requirements

### Requirement: Chat Detail Identity Display

The chat detail screen SHALL render the current conversation identity and team message sender names using the shared UIKit appellation rules. In team chats, visible sender names SHALL refresh when the current highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Reply quote sender prefers friend alias

- **GIVEN** the user is in a team chat
- **AND** the replied message sender has a friend remark, a team nickname, and a personal nickname
- **WHEN** RN shows that sender in the reply quote area
- **THEN** the reply quote sender label MUST use the friend remark first
- **AND** it MUST fall back in the order `群昵称 > 个人昵称 > accid`
