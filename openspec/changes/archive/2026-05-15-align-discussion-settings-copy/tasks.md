## 1. Spec Alignment

- [x] 1.1 Record testcase `0326` discussion-settings copy requirements.
- [x] 1.2 Confirm current RN settings page uses generic group copy.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update discussion settings page copy for name, avatar, and exit action.
- [x] 2.2 Re-verify testcase `0326-讨论组设置页面UI` only, and do not advance to the next testcase until it passes.
- [x] 2.3 Persist a discussion marker for teams created from one-to-one invite flows.
- [x] 2.4 Keep unmarked teams on normal group settings copy and actions.
- [x] 2.5 Re-verify testcase `0346-群组设置页UI` only before advancing.
- [x] 2.6 Add the group information page and route the group name chevron to it.
- [x] 2.7 Re-verify testcase `0350-点击群名称右边箭头` only before advancing.
- [x] 2.8 Disable the chat composer for normal members while group chat banned mode is enabled.
- [x] 2.9 Re-verify testcase `0356-群禁言` only before advancing.
- [x] 2.10 Clear unsent normal-member drafts when group chat banned mode becomes enabled.
- [x] 2.11 Re-verify testcase `0358-群聊输入框输入文字后未发送，群禁言开启` only before advancing.
- [x] 2.12 Use the explicit dismissed-group prompt for `onTeamDismissed`.
- [x] 2.13 Re-verify testcase `0363-解散群聊` only before advancing.
- [x] 2.14 Hide member add entry at the group member limit and validate over-limit picks on confirm.
- [x] 2.15 Re-verify testcase `0365-群成员达到上限邀请成员` only before advancing.
- [x] 2.16 Route the current user's member-list row to the self profile page.
- [x] 2.17 Re-verify testcase `0370-点击群成员头像` only before advancing.
- [x] 2.18 Exclude team nicknames from avatar fallback labels.
- [x] 2.19 Re-verify testcase `0372-查看群成员头像` only before advancing.
- [x] 2.20 Sort group member lists with the owner first and others by join time.
- [x] 2.21 Re-verify testcase `0373-群成员列表排序` only before advancing.
- [x] 2.22 Refresh the member list page on current-group member change events.
- [x] 2.23 Re-verify testcase `0374-群成员列表页他人加入-退出群聊` only before advancing.
- [x] 2.24 Page through all team members when loading member lists.
- [x] 2.25 Re-verify testcase `0376-群人数大于200人群聊，成员展示完整` only before advancing.
- [x] 2.26 Align the group member search placeholder copy.
- [x] 2.27 Re-verify testcase `0377-搜索框占位文案` only before advancing.
- [x] 2.28 Align the member search empty-result copy.
- [x] 2.29 Re-verify testcase `0379-搜索无匹配结果` only before advancing.
- [x] 2.30 Search member lists by visible name only and order managers before normal members.
- [x] 2.31 Re-verify testcase `0380-搜索群成员` only before advancing.
- [x] 2.32 Align the remove-member confirmation copy and actions.
- [x] 2.33 Re-verify testcase `0387-移除群成员二次确认` only before advancing.
- [x] 2.34 Map remove-member no-permission errors to the expected copy without refreshing buttons.
- [x] 2.35 Re-verify testcase `0391-管理员移除群成员过程被收回权限` only before advancing.
- [x] 2.36 Refresh member-list permissions when the current user is promoted.
- [x] 2.37 Re-verify testcase `0392-在群成员列表被授予编辑群成员权限` only before advancing.
