# team-mention-name-priority Specification

## Purpose

TBD - created by archiving change align-team-mention-name-priority. Update Purpose after archive.

## Requirements

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

### Requirement: Team mention insertion uses group-visible names

When a regular member is selected from the RN team chat mention selector, the composer SHALL insert the visible mention token using the priority `群昵称 > 个人昵称 > accid`.

#### Scenario: Selecting a friend member with a friend remark

- **GIVEN** a friend member has a friend remark, group nickname, and personal nickname
- **WHEN** the user selects that member from the `@` mention selector
- **THEN** the composer SHALL insert `@` followed by the group nickname
- **AND** it SHALL NOT insert the friend remark

#### Scenario: Selecting a non-friend member with a personal nickname

- **GIVEN** a non-friend member has no group nickname
- **AND** that member has a personal nickname available from profile data
- **WHEN** the user selects that member from the `@` mention selector
- **THEN** the composer SHALL insert `@` followed by the personal nickname
- **AND** it SHALL NOT insert the account ID while the personal nickname is available
