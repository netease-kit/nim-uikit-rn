## Why

部分 SDK 错误原文会直接展示给用户，例如“操作失败，friend not exist”，导致中英文混杂且不符合当前语言设置。聊天页进入消息多选后，被标记消息也必须像普通可选消息一样显示多选框，否则用户无法明确选择状态。

## What Changes

- 新增 SDK 错误展示文案归一化能力，将常见错误码和英文错误原文转换为当前应用语言。
- 将共享 toast 展示入口接入错误文案归一化，减少后续页面继续透传英文 SDK 原文。
- 添加好友搜索和好友名片操作错误使用同一套错误展示归一化。
- 调整聊天页 RN UIKit 消息气泡布局，使被标记消息在多选模式下显示并保留多选框。

## Capabilities

### New Capabilities

### Modified Capabilities

- `language-preferences`: 当前语言下的错误反馈不得直接透传已知 SDK 英文原文。
- `chat-forwarding-and-selection`: 多选模式下被标记消息的选择框展示规则。
- `native-toast-feedback`: 共享 toast 展示已知 SDK 错误时使用本地化文本。

## Impact

- Affected code: `utils/app-language.ts`, `utils/error-message.ts`, `src/NEUIKit/common/utils/toast.*`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `app/friend/*`
- Affected behavior: SDK 错误反馈文案、聊天消息多选布局
- No API or dependency changes.
