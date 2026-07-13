## MODIFIED Requirements

### Requirement: Team Notification Messages In Conversations

The app SHALL render human-readable team notification messages in conversation views. Participant names in membership notifications SHALL prefer friend alias when available, then personal nickname, message-carried nickname, and account id; they MUST NOT use stale team nicknames for users who left and later rejoined.

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
