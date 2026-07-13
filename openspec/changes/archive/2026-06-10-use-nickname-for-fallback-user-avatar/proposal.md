## Why

RN 当前无预设头像时，用户文字头像占位文案复用了称谓链路，导致好友备注和群昵称也会参与头像取值。这样会在会话列表、好友列表、聊天页、名片页、@ 列表、群成员列表、好友选择器、群成员选择器、黑名单等多个页面，把好友备注错误地用作头像占位文字来源。

测试和原生参考实现要求用户文字头像不取备注或群昵称，而应统一按“昵称 > accid”回退。

## What Changes

- 收敛 RN 用户文字头像占位规则，统一为“预设头像 > 昵称后两位 > accid 后两位”。
- 明确头像占位与称谓展示分离：称谓仍可按备注/群昵称/昵称/accid 展示，但用户头像占位不再取备注和群昵称。
- 调整 RN 中少数手动读取头像占位文案的页面，使其与 UIKit 底层规则一致。

## Capabilities

### Modified Capabilities

- `conversation-list`: 单聊用户头像占位字符规则统一。
- `contact-blacklist-and-teams`: 黑名单和成员类列表的用户头像占位字符规则统一。
- `chat-message-actions-and-receipts`: 聊天相关用户头像占位字符规则统一。

## Impact

- 受影响代码：`src/NEUIKit/rn/identity.ts`、`src/NEUIKit/rn/components.tsx`，以及使用自定义头像占位字符的 RN 页面
- 受影响行为：用户无预设头像时的文字头像取值
- 无新增依赖，无协议变更
