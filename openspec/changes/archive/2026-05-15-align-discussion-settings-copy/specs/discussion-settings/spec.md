## ADDED Requirements

### Requirement: Discussion Settings Page Copy

The app SHALL present discussion-group settings with discussion-specific copy.

#### Scenario: Discussion settings page UI

- **WHEN** the user opens the settings page for a discussion group
- **THEN** the page title MUST be `设置`
- **AND** the page MUST show the discussion avatar and discussion name
- **AND** the member row MUST show member count and member avatars
- **AND** the page MUST include mark, history, notification, and stick-top settings
- **AND** the bottom action MUST be `退出讨论组`

### Requirement: Group Settings Page Copy And Permissions

The app SHALL present normal group settings with group-specific copy and role-based controls.

#### Scenario: Group settings page UI

- **WHEN** the user opens the settings page for a normal group
- **THEN** the page title MUST be `设置`
- **AND** the page MUST show the group avatar and group name
- **AND** the member add entry MUST be shown only when the current user has invite permission
- **AND** the member add entry MUST be hidden when the group member count has reached the member limit
- **AND** the page MUST include mark, history, notification, and stick-top settings
- **AND** the page MUST show `群管理` only to the group owner and administrators
- **AND** the page MUST show `群禁言` only to the group owner
- **AND** the bottom action MUST be `解散群聊` for the group owner
- **AND** the bottom action MUST be `退出群聊` for normal members

#### Scenario: Group information entry

- **WHEN** the user taps the group name row chevron from the group settings page
- **THEN** the app MUST open a `群信息` page
- **AND** the page MUST show group avatar, group name, and group introduction entries

#### Scenario: Group name input length

- **WHEN** the user edits the group name
- **THEN** the input MUST accept up to 30 characters
- **AND** the 31st character MUST NOT be displayed
- **AND** long group names MUST be able to wrap to a second line while editing

#### Scenario: Cancelling group name edits

- **WHEN** the user edits the group name and taps `取消`
- **THEN** the app MUST return to the previous page
- **AND** the group name MUST remain unchanged

#### Scenario: Saving group name edits

- **WHEN** the user edits the group name to a non-empty value and saves
- **THEN** the app MUST update the group name and return to the previous page
- **WHEN** the group name input is empty
- **THEN** the save action MUST be disabled
- **AND** the app MUST NOT submit the group name update

#### Scenario: Saving group name edits while offline

- **WHEN** the user edits the group name and saves while the network is unavailable
- **THEN** the app MUST show `当前网络不可用，请检查你的网络设置`
- **AND** the app MUST remain on the group name edit page
- **AND** the app MUST NOT submit the group name update

#### Scenario: Group intro edit page UI

- **WHEN** the user opens the group intro edit page
- **THEN** the page title MUST be `群介绍`
- **AND** the header MUST show `取消`
- **AND** users with group information edit permission MUST see `保存`
- **AND** users without group information edit permission MUST NOT see the save action
- **AND** the page MUST show an intro input box

#### Scenario: Group avatar edit page UI

- **WHEN** the user opens the group avatar edit page
- **THEN** the page title MUST be `修改头像`
- **AND** the header MUST show `取消` and `保存` actions
- **AND** the page MUST show the current group avatar with a camera icon overlay
- **AND** the page MUST show `选择默认头像`
- **AND** the page MUST show five default group avatar options

#### Scenario: Group avatar read-only page UI

- **WHEN** a user without group information edit permission opens the group avatar edit page
- **THEN** the page MUST show the current group avatar only
- **AND** the page MUST NOT show the camera icon overlay
- **AND** the page MUST NOT show default group avatar options
- **AND** the page MUST NOT show a save action

#### Scenario: Opening group avatar source actions

- **WHEN** the user taps the camera icon on the group avatar edit page
- **THEN** the app MUST show a bottom action sheet
- **AND** the action sheet MUST show `拍摄`
- **AND** the action sheet MUST show `从相册选择`
- **AND** the action sheet MUST show `取消`

#### Scenario: Saving a local group avatar image

- **WHEN** the user selects or captures a local image for the group avatar
- **THEN** the app MUST allow system image editing before previewing the image
- **AND** saving MUST upload local image files before updating the group avatar
- **AND** the app MUST return to the previous page after the group avatar is saved

#### Scenario: Saving a local group avatar image while offline

- **WHEN** the user selects or captures a local image for the group avatar
- **AND** the network is unavailable when the user saves
- **THEN** the app MUST show `当前网络不可用，请检查你的网络设置`
- **AND** the app MUST remain on the avatar edit page
- **AND** the selected preview MUST remain available for retry after reconnecting

#### Scenario: Group dismissal from settings

- **WHEN** the group owner confirms `解散群聊`
- **THEN** the app MUST dismiss the group
- **AND** the current device MUST delete the group conversation and return to the conversation list
- **AND** members viewing the dismissed group chat MUST see `该群聊已解散`
- **AND** confirming the dismissed prompt MUST delete the group conversation and return to the conversation list

#### Scenario: Inviting members near the group member limit

- **WHEN** the user opens the member picker for a group that has not reached its member limit
- **AND** the user selects invitees that would exceed the member limit
- **THEN** the app MUST show a limit warning on the picker page
- **AND** the app MUST remain on the picker page

#### Scenario: Opening members from the member list

- **WHEN** the user taps another member from the group member list
- **THEN** the app MUST open that member's profile card
- **WHEN** the user taps their own member row
- **THEN** the app MUST open the current user's profile detail page

#### Scenario: Removing a member confirmation

- **WHEN** a user with member removal permission taps a member removal action
- **THEN** the app MUST show a confirmation titled `是否移除`
- **AND** the confirmation content MUST be `移除后该成员将离开当前群聊`
- **AND** the destructive confirmation action MUST be `移除`
- **AND** cancelling MUST keep the member in the list

#### Scenario: Removing a member while offline

- **WHEN** a user confirms member removal while the network is unavailable
- **THEN** the app MUST NOT call the member removal SDK operation
- **AND** the app MUST show `当前网络异常，请检查你的网络设置`
- **AND** the confirmation dialog MUST be dismissed

#### Scenario: Removal permission revoked during confirmation

- **WHEN** an administrator opens the remove-member confirmation
- **AND** their removal permission is revoked before confirming
- **THEN** the remove request failure MUST show `您暂无操作权限`
- **AND** the current page MUST NOT remove existing removal buttons solely because of that failed request

#### Scenario: Member avatar fallback label

- **WHEN** a group member has no avatar image
- **THEN** the avatar fallback label MUST prefer the member's friend alias
- **AND** it MUST then prefer friend/user nickname
- **AND** it MUST finally fall back to the account ID
- **AND** it MUST NOT use the team nickname as the fallback label

#### Scenario: Member list sorting

- **WHEN** the group member list is shown
- **THEN** the group owner MUST be listed first
- **AND** administrators MUST be listed before normal members
- **AND** members within the same role group MUST be sorted by join time ascending
- **AND** the owner row MUST show the owner role label

#### Scenario: Member list realtime updates

- **WHEN** the group member list page is open
- **AND** members join, leave, or are kicked from the current group
- **THEN** the member list MUST refresh for the current group
- **WHEN** another member's displayed member information changes while the group member list page is open
- **THEN** the member list MUST refresh for the current group
- **WHEN** the current user is promoted from a normal member to a manager or owner while the page is open
- **THEN** the member list permissions MUST refresh and show removal actions for removable members

#### Scenario: Complete large member lists

- **WHEN** the app loads members for a group
- **THEN** it MUST page through the member API until all pages are loaded
- **AND** group member lists MUST be able to display groups larger than one page

#### Scenario: Member search placeholder

- **WHEN** the group member list page is shown
- **THEN** the search input placeholder MUST be `搜索`

#### Scenario: Member search empty result

- **WHEN** a member search has no matching result
- **THEN** the member list empty text MUST be `暂无结果`

#### Scenario: Member search matching

- **WHEN** the user searches the group member list
- **THEN** matching MUST use the visible member display name
- **AND** account ID MUST NOT be used as an extra match field

#### Scenario: Group chat banned input state

- **WHEN** the group owner enables group chat banned mode
- **AND** a normal group member opens the group chat detail page
- **THEN** the composer placeholder MUST show `当前群主设置为禁言`
- **AND** any unsent draft text MUST be cleared
- **AND** the keyboard and composer panels MUST be dismissed
- **AND** the text input, emoji, voice, media, and more-message controls MUST be inert
- **AND** the group owner and administrators MUST remain able to send messages

#### Scenario: Discussion groups are identified explicitly

- **WHEN** a discussion group is created from a one-to-one chat invite flow
- **THEN** the created team MUST persist an app-level discussion marker
- **AND** settings opened for that team MUST keep discussion-specific copy
- **AND** unmarked teams MUST be treated as normal groups
