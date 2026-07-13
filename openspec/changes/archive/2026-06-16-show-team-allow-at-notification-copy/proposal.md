## Why

群管理页切换“谁可以@所有人”后，SDK 下发的群信息更新通知包含 `serverExtension.yxAllowAt`，但 RN 通知文案没有识别该字段，聊天页显示为通用的“群信息已更新”。该通知应明确展示 @ 所有人权限的新值。

## What Changes

- 团队信息更新通知解析 `updatedTeamInfo.serverExtension.yxAllowAt`。
- 当值为 `manager` 时，通知显示“@所有人权限更新为群主和管理员”。
- 当值为 `all` 时，通知显示“@所有人权限更新为所有人”。
- 其他团队更新通知保持现有文案。

## Impact

- Affects chat team-notification message copy.
- No SDK API, team management write path, or data model changes.
