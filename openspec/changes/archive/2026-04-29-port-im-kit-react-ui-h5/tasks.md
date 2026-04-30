## 0. Spec Freeze

- [x] 0.1 落下 `auth-form-and-sms` 与 `auth-session-lifecycle`
- [x] 0.2 落下 `conversation-list-behavior`、`conversation-search-and-picker`、`team-create-entry`
- [x] 0.3 落下 `contacts-home`、`friend-search-and-card`、`friend-verification-center`、`contact-blacklist-and-teams`
- [x] 0.4 落下 `chat-timeline-and-history`、`chat-message-content`、`chat-message-actions-and-receipts`、`chat-forwarding-and-selection`
- [x] 0.5 落下 `p2p-session-settings`、`team-settings-and-members`、`team-metadata-editing`
- [x] 0.6 落下 `profile-home-and-account`、`message-collection`、`profile-field-editing`、`notification-preferences`、`appearance-preferences`
- [x] 0.7 落下 `permission-flows`、`push-routing-and-delivery`
- [x] 0.8 运行 `OPENSPEC_TELEMETRY=0 openspec validate port-im-kit-react-ui-h5 --type change --no-interactive`

## 1. Foundation

- [ ] 1.1 引入所需 Expo/RN 基础依赖与配置：本地存储、剪贴板、图片选择、文件选择、通知、网络检测
- [ ] 1.2 扩展 `constants/NIMConfig.ts` 和相关配置模型，支持短信登录、user-center 接口、推送偏好与本地持久化键
- [ ] 1.3 建立统一的 NIM 事件桥接与领域 store 基础结构

## 2. Auth And Shell

- [ ] 2.1 新增 `AuthStore`，实现手机号验证码请求、注册确认、登录持久化、自动登录和退出登录
- [ ] 2.2 将根路由改造成 authenticated shell，落三栏 `Conversation / Contacts / My`
- [ ] 2.3 在根布局统一绑定 NIM 登录态、连接态、会话、消息、好友、用户、群组、设置等事件

## 3. Conversation Module

- [ ] 3.1 重构 `ConversationStore`，补齐排序、置顶、删除、未读、免打扰、空态和多端同步
- [ ] 3.2 新增会话搜索页、人员选择页、建群入口和搜索结果跳转
- [ ] 3.3 实现会话项手势或长按动作，以及建群/讨论组创建链路

## 4. Contact Module

- [ ] 4.1 新增 `FriendStore` 和联系人主页，覆盖好友列表、验证中心、黑名单、群聊列表
- [ ] 4.2 实现陌生人搜索、陌生人名片、添加好友、接受/拒绝好友申请、验证未读数同步
- [ ] 4.3 实现好友备注编辑、黑名单增删和联系人昵称优先级刷新

## 5. Chat Module

- [ ] 5.1 重构 `MessageStore`，支持历史消息分页、消息发送状态、重发、撤回、回复、已读回执、消息标记
- [ ] 5.2 新增聊天详情附属页面与组件：消息操作面板、已读详情页、媒体与文件消息渲染
- [ ] 5.3 实现多选、单条转发、逐条转发、合并转发、最近转发会话和合并转发详情页
- [ ] 5.4 处理网络断开、重连、系统消息、通知点击回流和时间分组逻辑

## 6. Team And Session Settings

- [ ] 6.1 新增 `TeamStore` 和会话设置页，覆盖单聊设置、群聊设置、消息提醒和聊天置顶
- [ ] 6.2 实现群创建、邀请成员、成员管理、退出、解散、群禁言和角色权限刷新
- [ ] 6.3 实现群信息编辑页：群名、头像、介绍、群昵称等子页面

## 7. Profile And Preferences

- [ ] 7.1 新增 `UserStore` 和 `PreferenceStore`，实现我的主页、设置页、关于页和收藏入口
- [ ] 7.2 实现个人资料编辑：头像、昵称、性别、生日、手机、邮箱、签名
- [ ] 7.3 实现通知、响铃、震动、通知详情、已读回执等偏好设置
- [ ] 7.4 实现外观选择、重复切换和重启恢复

## 8. Permissions And Push

- [ ] 8.1 接入通知授权、相机权限、相册权限检查与系统设置跳转
- [ ] 8.2 将偏好设置绑定到通知内容和会话免打扰逻辑
- [ ] 8.3 实现前台、后台、冷启动通知点击进入对应会话的路由恢复

## 9. Validation

- [x] 9.1 运行 `OPENSPEC_TELEMETRY=0 openspec validate port-im-kit-react-ui-h5 --type change --no-interactive`
- [x] 9.2 运行 `npm run lint`
- [x] 9.3 运行 `npx tsc --noEmit`
- [ ] 9.4 手工验证登录、会话、通讯录、聊天、群组、资料编辑、权限和通知主要链路

## 10. H5 UIKit UI Pass

- [x] 10.1 将登录、会话、通讯录、我的和聊天主界面主色统一到 H5 UIKit 的 `#337EFF` 蓝色体系
- [x] 10.2 将会话、通讯录和我的主页调整为 H5 UIKit 的白底列表、浅灰分隔和紧凑移动端行高结构
- [x] 10.3 将聊天消息气泡和输入扩展面板调整为 H5 UIKit 的浅蓝/浅灰气泡与灰底输入面板结构
- [x] 10.4 运行 `OPENSPEC_TELEMETRY=0 openspec validate port-im-kit-react-ui-h5 --type change --no-interactive`
- [x] 10.5 运行 `npx tsc --noEmit`
- [x] 10.6 运行 `npm run lint`
- [x] 10.7 运行 app 源码范围的 `npx prettier --check`

## 11. NEUIKit Workflow Alignment

- [x] 11.1 将 H5 `src/NEUIKit` 复制到当前仓库 `src/NEUIKit` 作为 UIKit 基线
- [x] 11.2 引入 `@xkit-yx/im-store-v2`、`@xkit-yx/utils` 和 H5 UIKit 基础依赖
- [x] 11.3 更新 AI 工作流，要求页面能力优先使用或适配 `src/NEUIKit`
- [x] 11.4 更新架构文档，要求状态管理和基础方法优先使用 `@xkit-yx/im-store-v2`、`@xkit-yx/utils`
- [x] 11.5 建立 NEUIKit RN 适配层，隔离 DOM、Umi、`window`、`localStorage` 和 `.less` 等 Web-only 假设
- [x] 11.6 更新 AI 工作流和现有文档，要求功能完成后主动启动受影响 Expo 目标并记录启动验证结果

## 12. Page-by-page NEUIKit Replacement

- [x] 12.1 建立 `src/NEUIKit/rn` RN 适配组件入口
- [x] 12.2 建立 `@xkit-yx/im-store-v2` 根 store 桥接入口
- [x] 12.3 登录页切换到 NEUIKit RN 适配组件
- [x] 12.4 会话列表页切换到 NEUIKit RN 适配组件，并优先读取 im-store-v2 会话数据
- [x] 12.5 通讯录页切换到 NEUIKit RN 适配组件
- [x] 12.6 我的页切换到 NEUIKit RN 适配组件
- [ ] 12.7 聊天详情页切换到 NEUIKit RN 适配组件和 im-store-v2 消息能力
- [ ] 12.8 会话搜索、人员选择、好友、群组、设置和个人资料子页面逐页切换
- [x] 12.9 会话列表、聊天详情和通讯录头像/昵称展示对齐 H5 `Avatar`、`Appellation` 与 im-store-v2 `uiStore.getAppellation`

## 13. Web Startup Compatibility

- [x] 13.1 补齐 Expo SDK 55 / Reanimated 4 Web 编译所需的 `react-native-worklets`
- [x] 13.2 运行 `npm run web` 并访问 `http://localhost:8081` 验证 Web bundle 返回 HTTP 200
- [x] 13.3 修复 Web 启动时 NIM/Auth/Preference 初始化卡住导致登录页空白的问题，并用 headless Chrome 验证登录页 DOM 可见
- [x] 13.4 头像/昵称展示规则调整后重新运行 `npm run web` 并访问 `http://localhost:8081` 验证页面加载
- [x] 13.5 修复已有本地登录态时自动登录阻塞根布局导致 Web 白屏的问题，并用 headless Chrome 模拟 localStorage session 验证页面可见
- [x] 13.6 收紧 NIM 登录成功前的 im-store-v2 绑定和 SDK 数据刷新时机，并用 headless Chrome 验证登录页点击响应与旧 session 刷新恢复
- [x] 13.7 修复会话列表页初始刷新重复触发和会话点击等待 SDK Promise 导致页面无响应的问题，并验证 Web 根页面与 bundle 返回 HTTP 200
- [x] 13.8 移除未授权推送环境下的 NIM app-background 状态上报，避免 `v2SetAppBackground` 403 SDK 报错
- [x] 13.9 修复设置页退出登录无反馈问题，退出时先清理本地会话并返回登录页，再异步通知 NIM SDK 退出
- [x] 13.10 优化登录页手机号和验证码输入框焦点态，使高亮与 H5 UIKit 主色体系一致
- [x] 13.11 会话列表接入左滑操作，支持置顶/取消置顶和删除会话按钮
- [x] 13.12 会话列表右上角收敛为更多菜单，提供添加好友和创建群聊入口

## 14. Current UI Draft Icon Pass

- [x] 14.1 尝试读取 Figma UI 稿节点 `4044:18402`，当前 Figma API 返回 429 限流，精确节点数据暂不可用
- [x] 14.2 新增 RN 侧 `UIKitIcon`，统一使用 `src/NEUIKit/static` 下的图标资源
- [x] 14.3 将 Tab、会话列表、通讯录、我的、人员选择和聊天输入面板的页面图标替换为 `UIKitIcon`
- [x] 14.4 运行 `OPENSPEC_TELEMETRY=0 openspec validate port-im-kit-react-ui-h5 --type change --no-interactive`
- [x] 14.5 运行 `npx tsc --noEmit`
- [x] 14.6 运行 `npm run lint`

## 15. Contacts Pinyin Sorting

- [x] 15.1 将通讯录好友列表调整为按拼音首字母 `A-Z/#` 分组展示
- [x] 15.2 组内按展示名稳定排序，并继续保留黑名单过滤、昵称优先级和头像规则

## 16. Local Figma UI Alignment

- [x] 16.1 读取本地 Figma 导出稿 `/Users/xumengxiang/Downloads/即时通讯`，确认只映射当前已实现的登录、会话、通讯录、我的和聊天主链路
- [x] 16.2 将共享 RN UIKit 基础色、行高、搜索入口、头像、列表分隔和弹层样式调整到本地移动端稿
- [x] 16.3 将 Tab 主页头部、会话列表、通讯录快捷入口、我的页和聊天页输入区调整为本地稿表现，忽略未实现功能入口
- [x] 16.4 运行 OpenSpec 校验、类型检查、lint 和 Expo 启动验证
- [x] 16.5 补齐本地 Figma `首页` 作为未登录启动入口，并连接到现有登录页
- [x] 16.6 参考本地 Figma `消息列表`、`无网络状态`、`消息-点击效果`、`横划` 调整消息列表页行布局、离线条、按压态和左滑操作样式
- [x] 16.7 按本地 Figma `消息列表` 底部 Tab 模块调整 Tab 高度、背景、分割线和文字尺寸，并移除未实现 `圈组` Tab 后将剩余 Tab 使用 `space-around` 分布

## 17. Local Figma Design Source Workflow

- [x] 17.1 将 `/Users/xumengxiang/Downloads/即时通讯` 离线 Figma 导出移动到仓库内 `design/figma/instant-messaging`
- [x] 17.2 更新 AI 工作流入口，要求 UI 改动同时满足本地离线 Figma 视觉稿和 `src/NEUIKit`
- [x] 17.3 更新架构和 README 文档，明确 Figma 与 `src/NEUIKit` 不一致时应修改 NEUIKit/RN 适配层对齐 Figma
- [x] 17.4 运行 OpenSpec 校验和文档格式校验
- [x] 17.5 维护项目路由与本地 Figma 页面/状态稿的映射关系，并忽略 logo、icon 和纯切图
