## Why

群设置页当前展示了 `群管理` 入口，但点击后没有任何响应，因为入口没有绑定到实际页面。这个问题影响群主和管理员的核心管理流程，需要补齐可达的管理页和导航。

## What Changes

- 为群设置页的 `群管理` 入口补齐点击导航。
- 新增独立的群管理页，承接群禁言、邀请权限、群资料修改权限、邀请确认等管理项。
- 调整群设置页布局，使管理配置从设置页主体中收敛到独立管理页，和现有 Web 结构保持一致。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `team-settings-and-members`: 群设置页中的 `群管理` 入口需要可点击并打开独立的群管理页。

## Impact

受影响代码包括 [app/team/settings.tsx](/Users/xumengxiang/Documents/00.NetEase/05.IM/im2-rn-demo/app/team/settings.tsx)、新增的 `app/team/manage.tsx`，以及 `team-settings-and-members` 规格。
