## ADDED Requirements

### Requirement: Team Notification Messages In Conversations

The app SHALL render human-readable team notification messages in conversation views.

#### Scenario: Invited into a discussion group

- **WHEN** the user is invited into a discussion group and the SDK delivers the team notification message
- **THEN** the chat page MUST display a readable system join notification message
- **AND** the conversation list MUST show the discussion-group conversation entry

#### Scenario: Inviting members into a discussion group

- **WHEN** the user creates a discussion group or invites members and the SDK delivers the team invite notification message
- **THEN** the chat page MUST display a readable system invite notification using the inviter and invited member names

#### Scenario: Removing members from a group

- **WHEN** members are removed from a group and the SDK delivers the team kick notification message
- **THEN** the chat page MUST display a readable system notification using the removed member names
- **AND** the notification MUST describe removed members as `被移出群聊`

#### Scenario: Members leaving a group

- **WHEN** a member leaves a group and the SDK delivers the team leave notification message
- **THEN** the chat page MUST display a readable system notification using the leaving member name
- **AND** the notification MUST describe the member as `退出了群聊`

#### Scenario: Team notifications in conversation list

- **WHEN** the latest message in a conversation is a team notification message
- **THEN** the conversation list preview MUST display `[通知消息]`

#### Scenario: Group name update notification in chat

- **WHEN** the SDK delivers a team information update notification for the group name
- **THEN** the chat page MUST display the operator name and new group name
- **AND** the notification MUST describe the change as `修改群名称为`

#### Scenario: Group name update while chat is open

- **WHEN** the current group chat page is open
- **AND** another member updates the group name
- **THEN** the chat header MUST refresh to the latest group name
- **AND** the chat page MUST display the group name update notification
