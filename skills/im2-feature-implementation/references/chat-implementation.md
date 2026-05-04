# Chat Implementation

用于回答“当前仓库里的聊天和消息类功能是怎么做的”。

## 主要落点

- 页面入口：`app/chat/[id].tsx`
- 历史、转发、已读详情、pin 等页面：`app/chat/*`
- 主状态：`stores/MessageStore.ts`
- 会话联动：`stores/ConversationStore.ts`
- 转发辅助：`stores/ForwardStore.ts`、`utils/messageForward.ts`
- 文件处理：`utils/fileTransfer.ts`
- 网络 / 权限辅助：`utils/network.ts`、`utils/permissions.ts`

## 当前实现套路

1. 聊天页负责消息列表展示、输入框、消息操作菜单、选择态和页面跳转
2. `stores/MessageStore.ts` 负责消息同步、去重、发送、撤回、pin、回执、反垃圾提示、转发历史
3. 文件上传下载、权限申请、网络可用性检查优先走 utils，不直接塞进页面
4. 与会话列表的最后一条消息、排序和未读变化通过 `stores/ConversationStore.ts` 联动
5. 聊天扩展页放在 `app/chat/*`，不要把所有能力堆到 `[id].tsx`

## 新增聊天功能时的默认落点

- 消息气泡展示、菜单、弹窗、选择态：`app/chat/[id].tsx`
- 发送、历史、撤回、pin、回执、反垃圾：`stores/MessageStore.ts`
- 文件 / 转发 / 合并转发辅助逻辑：`utils/messageForward.ts`、`utils/fileTransfer.ts`
- 新的聊天扩展页：`app/chat/*.tsx`

## 常见扩展点

- 文本 / 图片 / 视频 / 文件消息
- 撤回
- 转发 / 合并转发
- pin
- 已读回执
- 收藏
- 举报 / 反垃圾提示
- 历史记录 / 搜索

## 典型实现步骤

1. 先判断功能是消息渲染能力还是消息状态能力
2. 渲染能力先补聊天页和扩展页
3. 状态能力优先补 `stores/MessageStore.ts`
4. 如涉及文件、权限、网络，补到 utils
5. 检查会话预览、聊天页、扩展页三处是否都要联动

## 最少测试面

- 首次进入会话拉历史
- 发送成功 / 失败 / 重试
- 撤回后本页和列表回显
- 转发成功 / 失败 / 超上限
- pin 和取消 pin
- 文件下载 / 打开
- 网络异常或权限不足
- 已读回执展示
