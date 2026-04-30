# Figma Page/State Mapping

This file maps the current Expo Router pages to the offline Figma page/state exports in this
directory. It intentionally ignores logo assets, icon-only exports, and pure slices such as
`mob-1.2-logo-组合`, `Rectangle 1401`, `Frame`, `搜索`, `添加`, and `更多`.

Rules for UI work:

- Project UI must satisfy both the Figma page/state export and the `src/NEUIKit` component system.
- If current NEUIKit UI differs from Figma, update the NEUIKit component or RN adapter to match
  Figma.
- OpenSpec specs and test cases remain the behavior contract when behavior conflicts with visuals.

## Route Mapping

| Project route | Figma page/state exports | Notes |
| --- | --- | --- |
| `app/home.tsx` | `首页` | Unauthenticated landing entry. |
| native splash / app startup | `启动页` | Startup visual reference; not a standalone Expo Router page. |
| `app/login.tsx` | `验证码注册/登录`, `验证码登录-错误提示` | Current login route is SMS-code login. |
| `app/login.tsx` | `帐号登录`, `邮箱注册`, `私有化配置` | Alternate login/config states in Figma; not separate current routes. |
| `app/(tabs)/index.tsx` | `消息列表`, `无网络状态`, `消息-点击效果`, `横划`, `更多`, `删除二次确认`, `消息置顶` | Conversation list, offline banner, pressed row, swipe actions, overflow menu, and destructive confirmation. |
| `app/(tabs)/contacts.tsx` | `主页面`, `验证消息`, `黑名单`, `群/讨论组`, `添加好友` | Contacts home, its shortcut entries, and the header add-friend entry. Figma `我的电脑` remains out of scope until the Expo demo has a dedicated device-sync route. |
| `app/(tabs)/my.tsx` | `我的` | Profile tab home. |
| `app/conversation/search.tsx` | `搜索` | Search page/state; the `搜索@2x` icon export is ignored. |
| `app/conversation/picker.tsx` | `创建群组`, `发送一个人的时候`, `发送多人` | Used for member picking, team creation, and forward target picking flows. |
| `app/chat/[id].tsx` | `单聊`, `群聊`, `单聊-语音`, `单聊-发送位置`, `正在输入中`, `消息异常`, `回复`, `多选`, `多选2`, `标记（适配群聊和单聊）`, `会话_更多` | Main chat route and inline message states/actions. |
| `app/chat/read-detail.tsx` | `已经读未读` | Read/unread receipt detail. |
| `app/chat/history.tsx` | `历史记录`, `历史记录-默认状态` | Chat history record list and default/empty state. |
| `app/chat/pins.tsx` | `消息置顶`, `单聊-标记`, `标记（适配群聊和单聊）` | Pinned/marked message list and related chat states. |
| `app/chat/forward.tsx` | `发送一个人的时候`, `发送多人`, `合并发送信息`, `逐条转发信息结果` | Forward target selection and forwarding result/confirmation states. |
| `app/chat/forward-selected.tsx` | `发送多人`, `合并发送信息` | Selected forward targets review. |
| `app/chat/merged-forward-detail.tsx` | `合并消息展开查看` | Merged-forward detail viewer. |
| `app/chat/media-viewer.tsx` | `播放视频`, `暂停` | Image/video preview route; video playback states map to these Figma exports. |
| `app/chat/file-detail.tsx` | `发送文件和发送视频`, `点击下载toast提示`, `聊天中/收藏中的文件`, `文件类目筛选` | File message detail/download flow and file-related visual states. |
| `app/chat/location-detail.tsx` | `单聊-发送位置` | Location message detail. |
| `app/chat/message-preview.tsx` | `收藏-详情`, `合并消息展开查看` | Text/custom message preview and collection detail style references. |
| `app/chat/report.tsx` | `消息异常` | Report form is a local carrier for abnormal/sensitive message flow; no dedicated Figma report page export. |
| `app/contacts/validlist.tsx` | `验证消息` | Friend verification center. |
| `app/contacts/blacklist.tsx` | `黑名单` | Blacklist management. |
| `app/contacts/teamlist.tsx` | `群/讨论组` | Joined team/group list. |
| `app/friend/add.tsx` | `添加好友`, `搜索` | Add-friend entry page and its live search result state. |
| `app/friend/friend-card.tsx` | `好友名片`, `陌生人名片` | Friend/self/stranger card states. |
| `app/friend/edit.tsx` | `备注名` | Friend remark editor. |
| `app/session/p2p-settings.tsx` | `单聊设置` | P2P session settings. |
| `app/team/settings.tsx` | `讨论组设置`, `高级群设置-群主`, `高级群设置-普通用户`, `邀请他人权限/群资料修改权限`, `群信息` | Team settings and role-specific setting states. |
| `app/team/members.tsx` | `群成员` | Team member list. |
| `app/team/member-picker.tsx` | `创建群组`, `发送多人` | Member selection for invite/create flows. |
| `app/team/edit.tsx` | `群名称`, `群介绍`, `我在群里的昵称`, `修改头像` | Team metadata and avatar edit route. |
| `app/user/my-detail.tsx` | `个人信息`, `修改头像`, `生日` | Self profile detail, avatar sheet, and birthday state. |
| `app/user/my-detail-edit.tsx` | `昵称/手机/邮箱` | Text profile field editor. |
| `app/user/gender.tsx` | `性别` | Gender selector. |
| `app/user/aboutNetease.tsx` | `关于云信` | About page. |
| `app/user/product-intro.tsx` | `关于云信` | Product intro entry is reached from About; no separate exported Figma page. |
| `app/user/collection.tsx` | `收藏`, `收藏-toast`, `收藏-详情`, `无收藏状态`, `聊天中/收藏中的文件`, `文件类目筛选` | Collection list, empty state, toast, detail, and file category states. |
| `app/user/notification-settings.tsx` | `设置-消息提醒` | Notification preference settings. |
| `app/user/setting.tsx` | `设置`, `设置-清理缓存` | General settings and cache-clean state. |
| `app/user/appearance.tsx` | none | Current route has no direct Figma export in this offline set. Keep NEUIKit-consistent unless a design export is added. |
| `app/+not-found.tsx` | none | Expo Router fallback; no direct Figma export. |

## Figma Exports Without Direct Current Routes

These are page/state exports in the offline Figma set that do not currently map to a dedicated
route, or are used only as inline states inside another route:

- `帐号登录`
- `邮箱注册`
- `私有化配置`
- `横划`
- `消息-点击效果`
- `无网络状态`
- `会话_更多`
- `正在输入中`
- `消息异常`
- `收藏-toast`
- `删除二次确认`
- `点击下载toast提示`

## Ignored Non-Page Exports

These exports are intentionally excluded from page/route mapping because they are logo/icon/slice
assets rather than pages or states:

- `mob-1.2-logo-组合`
- `Rectangle 1401`
- `Frame`
- `搜索@2x`
- `添加@2x`
- icon-only uses of `更多`
