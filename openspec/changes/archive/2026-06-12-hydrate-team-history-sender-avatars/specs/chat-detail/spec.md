## MODIFIED Requirements

### Requirement: Chat Detail Identity Display

The chat detail screen SHALL render the current conversation identity and team message sender names using the shared UIKit appellation rules. In team chats, visible sender names SHALL refresh when the current highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Team chat sender name reflects display-name source changes

- **GIVEN** a team chat message from friend A is visible
- **AND** A has a team nickname
- **WHEN** the user opens A's friend card from the message avatar and changes the current highest-priority displayed name source
- **THEN** returning to the team chat MUST show A's updated sender name

#### Scenario: Team chat sender name falls back after display-name source deletion

- **GIVEN** a team chat message from friend A is visible
- **AND** A has a friend alias and a team nickname
- **WHEN** the user opens A's friend card from the message avatar and deletes the friend alias
- **THEN** returning to the team chat MUST show the next sender name according to the existing precedence

#### Scenario: P2P chat header target nickname survives friend deletion and cold login

- **GIVEN** the user previously chatted with account A
- **AND** account A has a cloud user profile nickname
- **AND** account A has been deleted from the user's friend list
- **AND** the app has been uninstalled and reinstalled so local user caches are empty
- **WHEN** the user opens the historical P2P chat with account A
- **THEN** the chat header MUST resolve and display A's cloud profile nickname
- **AND** it MUST NOT fall back to displaying A's account ID while the profile can be fetched

#### Scenario: Reply quote sender prefers friend alias

- **GIVEN** the user is in a team chat
- **AND** the replied message sender has a friend remark, a team nickname, and a personal nickname
- **WHEN** RN shows that sender in the reply quote area
- **THEN** the reply quote sender label MUST use the friend remark first
- **AND** it MUST fall back in the order `群昵称 > 个人昵称 > accid`

#### Scenario: Team history sender avatar hydrates for non-friend members

- **GIVEN** the user is viewing a team chat detail page
- **AND** an older history page contains messages sent by a non-friend team member with a preset custom user avatar
- **WHEN** those historical messages become visible
- **THEN** RN MUST request the sender profile needed by the shared UIKit avatar resolver
- **AND** the sender avatar MUST converge to the preset custom avatar instead of the accid-generated fallback avatar
