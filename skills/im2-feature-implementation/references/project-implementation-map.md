# IM2 RN Demo Implementation Map

这个文件用于快速回答“当前仓库里某类功能通常是怎么实现的”。

## 首次定位顺序

1. `AGENTS.md`
2. `README.md`
3. `ARCHITECTURE.md`
4. 对应 route 文件
5. 对应 store
6. 相关 service / utils / constants
7. OpenSpec active change

## 功能到代码落点映射

### 启动 / 全局生命周期
- 根入口：`app/_layout.tsx`
- 关注点：字体加载、Splash、登录状态监听、消息监听、全局事件桥接

### 登录 / 鉴权
- 页面入口：`app/login.tsx`
- 状态：`stores/AuthStore.ts`
- SDK 初始化：`stores/NIMStore.ts`
- 短信接口：`services/auth.ts`
- 配置：`constants/NIMConfig.ts`
- 详细参考：`references/login-implementation.md`

### 会话列表
- 页面入口：`app/(tabs)/index.tsx`
- 状态：`stores/ConversationStore.ts`
- 联动消息：`stores/MessageStore.ts`
- 详细参考：`references/conversation-implementation.md`

### 聊天详情
- 页面入口：`app/chat/[id].tsx`
- 消息状态：`stores/MessageStore.ts`
- 转发辅助：`stores/ForwardStore.ts`
- 文件能力：`utils/fileTransfer.ts`
- 转发辅助方法：`utils/messageForward.ts`
- 详细参考：`references/chat-implementation.md`

### 联系人 / 好友
- 页面入口：`app/(tabs)/contacts.tsx`
- 详情或编辑：`app/friend/*`
- 状态：`stores/FriendStore.ts`
- 用户资料：`stores/UserStore.ts`
- 详细参考：`references/friend-implementation.md`

### 群组 / 团队
- 页面入口：`app/team/*`
- 团队状态：`stores/TeamStore.ts`
- 详细参考：`references/team-implementation.md`

### 个人中心 / 偏好设置
- 页面入口：`app/(tabs)/my.tsx`、`app/user/*`
- 偏好状态：`stores/PreferenceStore.ts`
- 收藏：`stores/CollectionStore.ts`
- 详细参考：`references/settings-implementation.md`

## 默认职责划分

### route
- 负责页面布局、交互编排、跳转、参数读取

### store
- 负责业务状态、异步调用、状态派发、列表和详情联动

### service
- 负责纯接口请求和数据交互封装

### utils
- 负责与页面无关的辅助逻辑、适配逻辑、工具函数

### constants
- 负责运行时配置、主题常量和静态常量

## 常见实现套路

### 新增一个用户可见功能
1. 先判断是否跨 OpenSpec 门槛
2. 找到该功能所属 route
3. 找到对应 store
4. 再确认是否需要补 service / utils / constants
5. 先做最小闭环
6. 再补边界交互和回归验证

### 从参考项目迁移功能
1. 先找当前仓库中最接近的功能入口
2. 先适配当前 route / store 边界
3. 再迁移参考实现中的业务逻辑
4. 不要照搬参考项目目录结构
5. 测试用例与当前仓库约束优先于参考实现

## 最少验证

### 页面改动
- `npm run lint`
- `npx tsc --noEmit`
- 手动验证目标页面

### store / 配置改动
- `npm run lint`
- `npx tsc --noEmit`
- `npx expo install --check`
- 手动验证登录 / 会话 / 聊天主链路
