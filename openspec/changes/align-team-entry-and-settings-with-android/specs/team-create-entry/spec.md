## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Conversation header menu exposes Android-aligned team entry actions

- **WHEN** the user opens the add menu in the conversation list header
- **THEN** the menu MUST show `添加好友`
- **AND** the menu MUST show `加入群组`
- **AND** the menu MUST show `创建讨论组`
- **AND** the menu MUST show `创建高级群`
- **AND** the action order MUST match the Android implementation

#### Scenario: Creating a discussion from the conversation header

- **WHEN** the user enters the picker from the conversation header `创建讨论组`
- **THEN** the picker MUST create a discussion-marked team
- **AND** the created chat MUST open directly after success

#### Scenario: Creating an advanced group from the conversation header

- **WHEN** the user enters the picker from the conversation header `创建高级群`
- **THEN** the picker MUST create a normal advanced group
- **AND** the created chat MUST open directly after success

#### Scenario: P2P invite flow still creates a discussion

- **WHEN** the user enters the picker from a one-to-one chat settings invite entry without an explicit mode
- **THEN** the picker MUST preserve the existing discussion-style creation behavior

#### Scenario: Joining a group from the conversation header

- **WHEN** the user opens `加入群组`, enters a keyword, and submits search
- **THEN** the app MUST search teams in-app
- **AND** each result MUST expose a join/apply action
- **WHEN** the target team allows free join
- **THEN** the app MUST join and open the chat directly
- **WHEN** the target team requires approval
- **THEN** the app MUST submit the join request and show success feedback
