## Why

当前创建群聊时没有显式设置邀请确认模式，实际行为会回落到 SDK 默认值，导致新建群聊默认需要被邀请者同意。这个默认值和现有 Web UIKit 行为不一致，需要对齐为建群后默认直接入群。

## What Changes

- 为创建群聊的 SDK 参数显式设置默认 `agreeMode` 为“不需要被邀请者同意”。
- 补充建群规格，明确新创建群聊的默认邀请确认模式。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `team-create-entry`: 创建群聊时的默认邀请确认模式需要明确为“不需要被邀请者同意”。

## Impact

受影响代码包括 [stores/TeamStore.ts](/Users/xumengxiang/Documents/00.NetEase/05.IM/im2-rn-demo/stores/TeamStore.ts) 和 `team-create-entry` 规格。
