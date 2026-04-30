# Conversation Implementation

用于回答“当前仓库里的会话类功能是怎么做的”。

## 主要落点

- 页面入口：`app/(tabs)/index.tsx`
- 搜索 / 选择会话：`app/conversation/search.tsx`、`app/conversation/picker.tsx`
- 状态：`stores/ConversationStore.ts`
- 消息联动：`stores/MessageStore.ts`

## 当前实现套路

1. 页面负责列表渲染、搜索入口、新建会话入口、长按或更多操作入口
2. `stores/ConversationStore.ts` 负责会话列表同步、分页、排序、置顶、免打扰、未读、删除
3. 页面点击会话时，先清未读，再按需触发消息历史加载，再跳转聊天页
4. 会话预览文案和时间格式优先在页面层做展示转换
5. SDK 原始会话数据合并、去重、排序留在 store

## 新增会话功能时的默认落点

- 列表展示样式、入口按钮、交互弹窗：`app/(tabs)/index.tsx`
- 会话属性变更、刷新、删除、未读状态：`stores/ConversationStore.ts`
- 进入会话前是否预拉消息：`stores/MessageStore.ts`

## 常见扩展点

- 会话置顶
- 会话免打扰
- 会话删除 / 清空消息
- 会话搜索
- 会话预览文案定制
- 未读统计和角标

## 典型实现步骤

1. 先确认功能是列表展示问题还是会话状态问题
2. 展示问题先改页面映射
3. 状态问题优先改 `stores/ConversationStore.ts`
4. 如果进入会话前需要加载消息，再联动 `stores/MessageStore.ts`
5. 最后验证会话列表、未读和聊天页联动

## 最少测试面

- 首次拉取会话列表
- 下拉刷新 / 分页加载
- 会话预览正确
- 置顶后排序正确
- 免打扰状态切换正确
- 未读清零正确
- 删除会话后列表更新正确
- 进入聊天页联动正确
