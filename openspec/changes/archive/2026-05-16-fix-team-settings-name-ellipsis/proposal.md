## Why

群设置页里的群名称配置项当前允许右侧文案换成两行，长群名会撑高整行，和现有页面样式不一致。这个显示问题需要收口成单行省略。

## What Changes

- 为信息行组件补充可配置的右侧文本行数。
- 将群设置页的群名称配置项限制为单行显示，超出部分使用省略号。
- 将群设置页中的群名称入口改为直接进入群名称编辑页，不再经过群信息页中转。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `team-settings-and-members`: 群设置页中的群名称配置项需要单行显示并在超出时省略。

## Impact

受影响代码包括 [src/NEUIKit/rn/contact-friend.tsx](/Users/xumengxiang/Documents/00.NetEase/05.IM/im2-rn-demo/src/NEUIKit/rn/contact-friend.tsx)、[app/team/settings.tsx](/Users/xumengxiang/Documents/00.NetEase/05.IM/im2-rn-demo/app/team/settings.tsx) 和 `team-settings-and-members` 规格。
