## Why

杀掉进程后重新打开应用进入会话列表，列表会先短暂显示一些无关头像，随后在身份资料和头像 URL 更新后恢复正确。会话列表使用虚拟化列表和 `expo-image`，头像组件没有提供图片回收 key，冷启动/列表复用时可能先展示复用单元格的旧图片。同时本地 `ConversationStore` 会给缺头像的会话补随机远程头像，冷启动资料未同步前会先展示这些随机图片，随后被正确头像覆盖。

## What Changes

- 为 RN UIKit 通用头像图片增加稳定的 `recyclingKey`。
- 用户头像使用账号、群成员上下文、头像 URL 和尺寸组成回收 key。
- 直接 URL 头像使用调用方传入的回收 key 或 URL 自身，避免列表单元格复用时闪现上一张图片。
- 移除本地会话缺头像时的随机远程头像兜底，改为留空并走稳定文字/颜色头像。

## Capabilities

### Modified Capabilities

- `conversation-list-avatar`: 冷启动会话列表头像不应短暂显示其他会话/用户的旧图片。

## Impact

- 受影响代码：`src/NEUIKit/rn/components.tsx`、`stores/ConversationStore.ts`
- 受影响行为：会话列表、联系人、群成员、聊天头像等复用 RN UIKit 头像组件的图片渲染
- 不改变头像来源优先级、昵称 fallback、在线状态或会话排序逻辑
