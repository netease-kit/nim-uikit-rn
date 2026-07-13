# Expose team invite mode management

## Why

The RN team management page lacks the Android-aligned setting for who can add group members. Although the app already respects `team.inviteMode` when showing the add-member entry, managers cannot change this permission from RN.

## What changes

- Add a team management row labeled "谁可以添加群成员" / "Who can add group members".
- Show the current `inviteMode` as "所有人" or "群主和管理员".
- Allow group owners and admins to update `inviteMode` to all members or owner/admins through the existing team update API.

## Impact

- Affects RN group management settings and add-member permission configuration.
- Reuses existing `team.inviteMode` behavior that already controls member invitation access.
