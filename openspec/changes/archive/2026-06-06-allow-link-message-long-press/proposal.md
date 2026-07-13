## Why

聊天页文本消息中的网页链接片段单独处理点击打开浏览器。当前 RN 真机上长按链接消息时，链接片段会直接触发浏览器打开，外层消息气泡的长按菜单无法展示，导致链接消息缺少复制、回复、转发等操作入口。

## What Changes

- 链接文本片段支持长按事件，并复用消息气泡的长按操作菜单。
- 普通点击链接仍保持打开浏览器。
- 选择模式下保持原有点击选择消息行为。

## Capabilities

### Modified Capabilities

- `chat-message-actions-and-receipts`: 链接类文本消息长按应展示消息操作面板。

## Impact

- 受影响代码：`src/NEUIKit/rn/chat.tsx`、`src/NEUIKit/rn/chat-message-bubble.tsx`
- 受影响行为：聊天页文本消息中网页链接片段的长按手势
- 不影响普通短按打开链接、非链接文本长按、图片/视频/文件等附件消息操作
