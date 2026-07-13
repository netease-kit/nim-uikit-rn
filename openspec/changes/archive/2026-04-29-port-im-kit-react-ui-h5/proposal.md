## Why

当前 React Native Demo 只覆盖账号密码登录、基础会话列表和文本消息收发，与 `nim-uikit-web/im-kit-react-ui-h5` 的能力面和 `TestCases.xlsx` 中的 856 条 RN 用例存在明显缺口。需要以测试用例为准，把 RN Demo 升级为可覆盖登录、会话、通讯录、聊天、会话设置、群组、个人中心、通知与权限配置的完整 UIKit 级应用。

## What Changes

- **BREAKING** 将登录链路从当前的账号密码直登调整为手机号验证码登录、自动登录和手动退出登录的统一会话模型。
- 将当前单 Tab Demo 扩展为与参考实现一致的三栏主壳：会话、通讯录、我的，并补齐对应的子页面路由。
- 新增测试驱动的聊天能力，包括多种消息类型展示、历史消息拉取、消息回复/撤回/已读回执/标记、发送失败恢复与网络态处理。
- 新增聊天高级操作能力，包括多选、单条转发、逐条转发、合并转发、最近转发会话与合并转发详情查看。
- 新增好友、验证消息、黑名单、好友备注、陌生人名片、群组列表、建群与群成员管理等通讯录能力。
- 新增单聊/群聊设置、会话置顶、免打扰、群信息编辑、成员管理、群禁言和退出/解散群等设置能力。
- 新增个人资料编辑、头像更新、昵称/资料项编辑、消息通知偏好、通知详情开关、关于云信与收藏入口。
- 新增外观选择与持久化能力，覆盖设置页切换和重启后的外观恢复。
- 新增相机、相册、通知授权检查与离线/在线推送配置入口，为测试用例中的权限和推送场景提供 RN 侧承载。

## Capabilities

### New Capabilities

- `auth-form-and-sms`: 登录页 UI、手机号与验证码输入规则、验证码请求与倒计时策略。
- `auth-session-lifecycle`: 自动登录、退出登录、多端登录冲突和注册同意弹窗。
- `conversation-list-behavior`: 会话列表 UI、排序、未读、置顶、删除、免打扰与空态。
- `conversation-search-and-picker`: 会话搜索、人员选择器、好友/数字人选择和搜索结果跳转。
- `team-create-entry`: 会话入口发起建群、讨论组/高级群创建、邀请人数与离线失败处理。
- `contacts-home`: 通讯录首页、好友目录入口、验证消息入口、黑名单入口和群聊列表入口。
- `friend-search-and-card`: 添加好友搜索、陌生人名片、自身/好友/陌生人状态判定与发起加好友。
- `friend-verification-center`: 好友验证消息列表、未读数、同意/拒绝、清空与状态合并。
- `contact-blacklist-and-teams`: 黑名单管理、好友备注联动、我的群聊列表与从通讯录进入群聊。
- `chat-timeline-and-history`: 聊天页头部、时间分组、消息定位、历史拉取、断网与重连恢复。
- `chat-message-content`: 文本、表情、链接、通知、图片、视频、音频、文件等消息内容展示与发送。
- `chat-message-actions-and-receipts`: 长按操作、复制、回复、撤回、重发、标记、已读未读详情。
- `chat-forwarding-and-selection`: 消息多选、删除、单条转发、逐条转发、合并转发与转发会话选择。
- `p2p-session-settings`: 单聊设置页、提醒开关、聊天置顶、邀请好友建群、更多入口。
- `team-settings-and-members`: 群设置页、群成员、加人、退群、解散、群禁言、角色权限与历史记录入口。
- `team-metadata-editing`: 群名称、群头像、群介绍、我的群昵称等子编辑页。
- `profile-home-and-account`: 我的页、个人信息总览、复制账号、关于云信、收藏入口。
- `message-collection`: 聊天收藏/取消收藏、收藏列表、收藏转发与取消收藏。
- `profile-field-editing`: 头像、昵称、性别、生日、手机、邮箱、签名等资料字段编辑规则。
- `notification-preferences`: 新消息通知、响铃、振动、通知详情、已读回执等偏好设置。
- `appearance-preferences`: 外观选择、反复切换和重启后的外观恢复。
- `permission-flows`: 通知授权、相机权限、相册权限请求、拒绝、再次请求与系统设置跳转。
- `push-routing-and-delivery`: 在线推送、离线推送、会话免打扰推送例外和通知点击回流。

### Modified Capabilities

## Impact

- 受影响代码包括 `app/` 下的根导航、Tab 路由和新增详情页，`stores/` 下的 NIM、会话、消息以及新增的用户/好友/群组/设置状态层。
- 需要更新 `constants/NIMConfig.ts`、`app.json` 以及登录持久化和推送/权限相关配置。
- 预计需要引入 Expo/RN 侧基础依赖以支持本地存储、剪贴板、图片选择、文件选择、通知、网络状态和权限能力。
- 手工验证范围将从当前登录/会话/聊天扩展到测试用例覆盖的主要模块与关键异常场景。
