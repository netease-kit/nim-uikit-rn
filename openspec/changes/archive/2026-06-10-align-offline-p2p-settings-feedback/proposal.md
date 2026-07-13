## Why

好友或数字人单聊设置页在无网时切换消息提醒或置顶开关，会直接透出 SDK 的 `illegal state` 错误，无法满足测试与产品要求中的统一断网反馈。需要让该页面在离线操作时稳定提示通用网络异常文案，并保持联网时的开关行为不变。

## What Changes

- 为单聊设置页的消息提醒与置顶开关增加显式离线校验。
- 将离线失败提示统一为通用断网文案 `当前网络异常，请检查你的网络设置`。
- 保持好友或数字人单聊设置页在联网时的提醒、置顶切换逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `p2p-session-settings`: 补充单聊设置页消息提醒与置顶开关在离线场景下的统一失败反馈要求。

## Impact

- 受影响代码：`app/session/p2p-settings.tsx`、`utils/app-language.ts`
- 受影响行为：好友或数字人单聊设置页离线切换消息提醒与置顶开关时的失败提示
- 无新增依赖，无接口协议变更
