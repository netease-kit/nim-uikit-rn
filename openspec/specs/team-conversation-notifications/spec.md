# team-conversation-notifications Specification

## Purpose

TBD - created by archiving change align-team-notification-message-copy. Update Purpose after archive.

## Requirements

### Requirement: Team Notification Messages In Conversations

The app SHALL render human-readable team notification messages in conversation views. Participant names in membership notifications SHALL prefer friend alias when available, then personal nickname, message-carried nickname, and account id; they MUST NOT use stale team nicknames for users who left and later rejoined.

#### Scenario: Inviting non-friend members into a group

- **GIVEN** A and B are friends
- **AND** A and C are friends
- **AND** B and C are not friends and do not share another group
- **WHEN** B is viewing the group chat page
- **AND** A invites C into that group
- **THEN** B's chat page MUST display the invite notification using C's nickname
- **AND** the notification MUST NOT display C's account id as the member name when C's user profile can be fetched
- **AND** the notification SHOULD avoid first rendering C's account id and then replacing it with the nickname in a visible flicker

#### Scenario: Rejoined member notification ignores old team nickname

- **GIVEN** account A had a team nickname in team T
- **AND** account A left team T or was removed from team T
- **WHEN** account A later rejoins team T and membership notifications are rendered
- **THEN** notification participant names for account A MUST NOT use A's old team nickname from before leaving
- **AND** the name MUST fall back to friend alias, personal nickname, message-carried nickname, or account id

#### Scenario: @-all permission changed to owner/admin only

- **GIVEN** a team information update notification contains `updatedTeamInfo.serverExtension.yxAllowAt` as `manager`
- **WHEN** the notification message is rendered in the chat conversation
- **THEN** the notification text SHALL display `@所有人权限更新为群主和管理员`
- **AND** it SHALL NOT fall back to the generic `群信息已更新` text

#### Scenario: @-all permission changed to everyone

- **GIVEN** a team information update notification contains `updatedTeamInfo.serverExtension.yxAllowAt` as `all`
- **WHEN** the notification message is rendered in the chat conversation
- **THEN** the notification text SHALL display `@所有人权限更新为所有人`
- **AND** it SHALL NOT fall back to the generic `群信息已更新` text

### Requirement: Team Invalidity Removes Conversation Access

The app SHALL converge team-conversation access when the current user is no longer allowed to stay in that team conversation because the team was dismissed, the user left, or the user was kicked.

#### Scenario: Current user is removed from a team outside the active chat page

- **WHEN** the SDK reports that the current user left a team, was kicked from a team, or the team was dismissed while the user is outside that chat page
- **THEN** the app MUST remove the corresponding team conversation from the conversation list without requiring a manual refresh
- **AND** future attempts to enter that stale conversation id MUST be blocked

#### Scenario: Team becomes invalid before entering chat

- **WHEN** the user taps a team conversation whose team metadata has already become invalid or unavailable
- **THEN** the app MUST avoid opening a broken chat detail state
- **AND** it MUST clean up the stale conversation entry or route the user back to the conversation list
