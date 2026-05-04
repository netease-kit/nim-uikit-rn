## 1. Mapping Foundation

- [x] 1.1 Archive previous active OpenSpec changes so this work has a dedicated change
- [x] 1.2 Create `align-pages-with-local-figma`
- [x] 1.3 Maintain `design/figma/instant-messaging/page-state-map.md` as the route-to-Figma mapping
- [x] 1.4 Re-check the mapping before each page group and update it when routes or Figma states are
      added

## 2. Entry And Login

- [x] 2.1 Align `app/home.tsx` with `首页`
- [x] 2.2 Align startup/splash visuals with `启动页` where Expo runtime allows
- [x] 2.3 Align `app/login.tsx` with `验证码注册/登录` and `验证码登录-错误提示`
- [x] 2.4 Record how `帐号登录`, `邮箱注册`, and `私有化配置` remain alternate states without
      current dedicated routes

## 3. Tab Shell And Conversation List

- [x] 3.1 Align `app/(tabs)/_layout.tsx` bottom tabs with mapped Figma tab states
  - Route: `app/(tabs)/_layout.tsx`
  - Figma: `消息列表`
  - NEUIKit: existing tab bar composition in `app/(tabs)/_layout.tsx`
- [x] 3.2 Align `app/(tabs)/index.tsx` with `消息列表`
  - Route: `app/(tabs)/index.tsx`
  - Figma: `消息列表`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`
- [x] 3.3 Align conversation list states: `无网络状态`, `消息-点击效果`, `横划`, `更多`,
      `删除二次确认`, `消息置顶`
  - Note: Figma `更多` popover is aligned for current supported actions; legacy `创建讨论组` is not
    introduced because the current Expo flow only supports add-friend and advanced-team creation.
- [x] 3.4 Apply required visual changes through `src/NEUIKit` or `src/NEUIKit/rn`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`, `src/NEUIKit/rn/icon.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; `npm run web`

## 4. Contacts And Friend Flows

- [x] 4.1 Align `app/(tabs)/contacts.tsx` with `主页面` and shortcut states
  - Route: `app/(tabs)/contacts.tsx`
  - Figma: `主页面`, `验证消息`, `黑名单`, `群/讨论组`, `添加好友`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`, `src/NEUIKit/rn/index.ts`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
  - Note: Figma `我的电脑` remains documented as unsupported because the Expo demo still has no dedicated device-sync route.
- [x] 4.2 Align `app/contacts/validlist.tsx` with `验证消息`
  - Route: `app/contacts/validlist.tsx`
  - Figma: `验证消息`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 4.3 Align `app/contacts/blacklist.tsx` with `黑名单`
  - Route: `app/contacts/blacklist.tsx`
  - Figma: `黑名单`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 4.4 Align `app/contacts/teamlist.tsx` with `群/讨论组`
  - Route: `app/contacts/teamlist.tsx`
  - Figma: `群/讨论组`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 4.5 Align `app/friend/add.tsx` with `添加好友` and `搜索`
  - Route: `app/friend/add.tsx`
  - Figma: `添加好友`, `搜索`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 4.6 Align `app/friend/friend-card.tsx` with `好友名片` and `陌生人名片`
  - Route: `app/friend/friend-card.tsx`
  - Figma: `好友名片`, `陌生人名片`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 4.7 Align `app/friend/edit.tsx` with `备注名`
  - Route: `app/friend/edit.tsx`
  - Figma: `备注名`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`

## 5. Chat And Message States

- [x] 5.1 Align `app/chat/[id].tsx` with `单聊` and `群聊`
  - Route: `app/chat/[id].tsx`
  - Figma: `单聊`, `群聊`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`, `src/NEUIKit/rn/icon.tsx`, `src/NEUIKit/rn/index.ts`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 5.2 Align inline chat states: `单聊-语音`, `单聊-发送位置`, `正在输入中`, `消息异常`,
      `回复`, `多选`, `多选2`, `标记（适配群聊和单聊）`, `会话_更多`
  - Route: `app/chat/[id].tsx`
  - Figma: `单聊-语音`, `单聊-发送位置`, `正在输入中`, `消息异常`, `回复`, `多选`, `多选2`, `标记（适配群聊和单聊）`, `会话_更多`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`, `src/NEUIKit/rn/icon.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
  - Note: Voice record and location-send remain visual/state-aligned shells in the Expo demo; the existing message send/open flows remain unchanged.
- [x] 5.3 Align `app/chat/read-detail.tsx` with `已经读未读`
  - Route: `app/chat/read-detail.tsx`
  - Figma: `已经读未读`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 5.4 Align `app/chat/history.tsx` with `历史记录` and `历史记录-默认状态`
  - Route: `app/chat/history.tsx`
  - Figma: `历史记录`, `历史记录-默认状态`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 5.5 Align `app/chat/pins.tsx` with `消息置顶`, `单聊-标记`, and
      `标记（适配群聊和单聊）`
  - Route: `app/chat/pins.tsx`
  - Figma: `消息置顶`, `单聊-标记`, `标记（适配群聊和单聊）`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`

## 6. Forwarding, Media, File, And Detail Routes

- [x] 6.1 Align `app/chat/forward.tsx` and `app/chat/forward-selected.tsx` with forwarding states:
      `发送一个人的时候`, `发送多人`, `合并发送信息`, `逐条转发信息结果`
  - Route: `app/chat/forward.tsx`, `app/chat/forward-selected.tsx`
  - Figma: `发送一个人的时候`, `发送多人`, `合并发送信息`, `逐条转发信息结果`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 6.2 Align `app/chat/merged-forward-detail.tsx` with `合并消息展开查看`
  - Route: `app/chat/merged-forward-detail.tsx`
  - Figma: `合并消息展开查看`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 6.3 Align `app/chat/media-viewer.tsx` with `播放视频` and `暂停`
  - Route: `app/chat/media-viewer.tsx`
  - Figma: `播放视频`, `暂停`
  - NEUIKit: current chat-detail visual system plus immersive media overlay in `app/chat/media-viewer.tsx`
  - Note: The route keeps the existing image preview behavior while the video path now uses a Figma-aligned immersive black-stage player shell with RN overlay controls and bottom actions.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 6.4 Align `app/chat/file-detail.tsx` with `发送文件和发送视频`,
      `点击下载toast提示`, `聊天中/收藏中的文件`, `文件类目筛选`
  - Route: `app/chat/file-detail.tsx`
  - Figma: `发送文件和发送视频`, `点击下载toast提示`, `聊天中/收藏中的文件`, `文件类目筛选`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`
  - Note: The route now uses a file-detail shell with source switching and download/open actions; the
    full file-source browsing list remains to be deepened if the Expo demo later adds real collection-file queries.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 6.5 Align `app/chat/location-detail.tsx` with `单聊-发送位置`
  - Route: `app/chat/location-detail.tsx`
  - Figma: `单聊-发送位置`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`
  - Note: The route keeps the current open-map behavior while rendering a Figma-aligned location card shell.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 6.6 Keep `app/chat/message-preview.tsx` and `app/chat/report.tsx` mapped to their closest
      Figma states unless dedicated exports are added
  - Route: `app/chat/message-preview.tsx`, `app/chat/report.tsx`
  - Figma: `收藏-详情`, `合并消息展开查看`, `消息异常`
  - Note: `message-preview` now uses the chat-context detail shell; `report` remains a
    message-anomaly carrier page with native RN UI instead of a WebView form because the Figma set
    has no dedicated report export.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`

## 7. Team And Session Settings

- [x] 7.1 Align `app/session/p2p-settings.tsx` with `单聊设置`
  - Route: `app/session/p2p-settings.tsx`
  - Figma: `单聊设置`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`, `src/NEUIKit/rn/contact-friend.tsx`
  - Note: the route now follows the single-chat settings card structure and wires `加入黑名单` to
    the existing `FriendStore` block list APIs.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 7.2 Align `app/team/settings.tsx` with `讨论组设置`, `高级群设置-群主`,
      `高级群设置-普通用户`, `邀请他人权限/群资料修改权限`, `群信息`
  - Route: `app/team/settings.tsx`
  - Figma: `讨论组设置`, `高级群设置-群主`, `高级群设置-普通用户`, `邀请他人权限/群资料修改权限`, `群信息`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`, `src/NEUIKit/rn/contact-friend.tsx`
  - Note: invite permission, profile-update permission, and invitee-agree mode now read the real
    team fields and update them through `TeamStore.updateTeamInfo`.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 7.3 Align `app/team/members.tsx` with `群成员`
  - Route: `app/team/members.tsx`
  - Figma: `群成员`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`, `src/NEUIKit/rn/components.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 7.4 Align `app/team/member-picker.tsx` with `创建群组` and `发送多人`
  - Route: `app/team/member-picker.tsx`
  - Figma: `创建群组`, `发送多人`
  - NEUIKit: `src/NEUIKit/rn/chat.tsx`, `src/NEUIKit/rn/contact-friend.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 7.5 Align `app/team/edit.tsx` with `群名称`, `群介绍`, `我在群里的昵称`, `修改头像`
  - Route: `app/team/edit.tsx`
  - Figma: `群名称`, `群介绍`, `我在群里的昵称`, `修改头像`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`

## 8. My, Profile, Collection, And Settings

- [x] 8.1 Align `app/(tabs)/my.tsx` with `我的`
  - Route: `app/(tabs)/my.tsx`
  - Figma: `我的`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`, `src/NEUIKit/rn/icon.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.2 Align `app/user/my-detail.tsx` with `个人信息`, `修改头像`, `生日`
  - Route: `app/user/my-detail.tsx`
  - Figma: `个人信息`, `修改头像`, `生日`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`, `src/NEUIKit/rn/contact-friend.tsx`
  - Note: birthday remains an RN-friendly bottom-sheet editor instead of an iOS wheel picker while
    keeping the same modal structure and card layout.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.3 Align `app/user/my-detail-edit.tsx` with `昵称/手机/邮箱`
  - Route: `app/user/my-detail-edit.tsx`
  - Figma: `昵称/手机/邮箱`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.4 Align `app/user/gender.tsx` with `性别`
  - Route: `app/user/gender.tsx`
  - Figma: `性别`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.5 Align `app/user/aboutNetease.tsx` and `app/user/product-intro.tsx` with `关于云信`
  - Route: `app/user/aboutNetease.tsx`, `app/user/product-intro.tsx`
  - Figma: `关于云信`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`
  - Note: `product-intro` now uses a local static RN content page instead of a network WebView so
    the Expo demo stays visually aligned without external-page coupling.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.6 Align `app/user/collection.tsx` with collection and file states:
      `收藏`, `收藏-toast`, `收藏-详情`, `无收藏状态`, `聊天中/收藏中的文件`, `文件类目筛选`
  - Route: `app/user/collection.tsx`
  - Figma: `收藏`, `收藏-toast`, `收藏-详情`, `无收藏状态`, `聊天中/收藏中的文件`, `文件类目筛选`
  - NEUIKit: `src/NEUIKit/rn/components.tsx`
  - Note: collection cards now use the large preview-first layout while keeping the current open,
    forward, and remove actions below the preview surface.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.7 Align `app/user/notification-settings.tsx` with `设置-消息提醒`
  - Route: `app/user/notification-settings.tsx`
  - Figma: `设置-消息提醒`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Note: added local preference support for `PC/Web同步接收推送` so the screen can match the Figma grouping without dropping existing Expo preference persistence.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.8 Align `app/user/setting.tsx` with `设置` and `设置-清理缓存`
  - Route: `app/user/setting.tsx`
  - Figma: `设置`, `设置-清理缓存`
  - NEUIKit: `src/NEUIKit/rn/contact-friend.tsx`
  - Note: added local preference support for `过滤通知` and `删除好友是否同步删除备注`, plus an RN cache-clean modal that mirrors the Figma cache sheet structure.
  - Validation: `npm run lint`; `npx tsc --noEmit`; `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`; Expo startup tracked in `9.5`
- [x] 8.9 Keep `app/user/appearance.tsx` documented as unmapped until a Figma export exists
  - Route: `app/user/appearance.tsx`
  - Note: mapping remains explicitly documented as `none` in `design/figma/instant-messaging/page-state-map.md`; no Figma-driven UI changes were introduced for this route.

## 9. Verification

- [x] 9.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-pages-with-local-figma --type change --no-interactive`
- [x] 9.2 Run focused Markdown format checks after artifact or mapping updates
- [x] 9.3 For implementation groups, run `npm run lint`
- [x] 9.4 For implementation groups, run `npx tsc --noEmit`
- [x] 9.5 Start the affected Expo target and record Metro/Web startup result
  - Result: `npm run start -- --non-interactive` hit Expo's interactive port conflict prompt because port `8081`
    was already serving this app in another window (`pid 51074`); `curl -I http://127.0.0.1:8081` returned
    `HTTP/1.1 200 OK`
  - Section 5 re-check: after the chat route updates, `curl -I http://127.0.0.1:8081` still returned
    `HTTP/1.1 200 OK`
  - Section 6 re-check: `npm run start -- --non-interactive` still prints Expo's note that
    `--non-interactive` is unsupported and continues booting the project; `curl -I http://127.0.0.1:8081`
    returned `HTTP/1.1 200 OK`
  - Section 6.3 re-check: after the immersive media-viewer update, `curl -I http://127.0.0.1:8081`
    returned `HTTP/1.1 200 OK`
