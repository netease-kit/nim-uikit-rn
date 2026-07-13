## MODIFIED Requirements

### Requirement: Team mention selector uses native-aligned display names

The RN team chat mention selector SHALL display each regular member's name using the priority `好友备注名 > 群昵称 > 个人昵称 > accid`.

#### Scenario: Non-friend member has a group nickname

- **GIVEN** the user is in a team chat
- **AND** a non-friend member has a group nickname
- **WHEN** the user opens the `@` mention selector
- **THEN** that member row SHALL display the group nickname
- **AND** it SHALL NOT display the account ID while the group nickname is available
- **AND** it SHALL NOT render a second accid description line below the visible candidate name

#### Scenario: Non-friend member has only a personal nickname

- **GIVEN** the user is in a team chat
- **AND** a non-friend member has no friend remark or group nickname
- **AND** that member has a personal nickname available from profile data
- **WHEN** the user opens the `@` mention selector
- **THEN** that member row SHALL display the personal nickname
- **AND** it SHALL NOT display the account ID while the personal nickname is available
- **AND** it SHALL NOT render a second accid description line below the visible candidate name

#### Scenario: Friend member has a friend remark

- **GIVEN** the user is in a team chat
- **AND** a friend member has a friend remark, group nickname, and personal nickname
- **WHEN** the user opens the `@` mention selector
- **THEN** that member row SHALL display the friend remark
- **AND** it SHALL NOT render a second accid description line below the visible candidate name
