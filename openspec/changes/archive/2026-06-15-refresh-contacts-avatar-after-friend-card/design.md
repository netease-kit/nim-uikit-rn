## Context

通讯录好友列表在生成 `FriendDirectoryItem` 时，调用了 `getUIKitAvatarUri(item.accountId, item.userProfile?.avatar)`。`explicitAvatar` 参数会被 `getUIKitAvatarUri` 优先返回，因此当好友关系对象中的 `userProfile.avatar` 仍是旧值时，即使好友卡片已经通过 `userStore.fetchUser` 拉到了新头像，列表也会继续显示旧头像。

## Decision

通讯录好友列表不再把 `friend.userProfile.avatar` 作为显式头像透传，而是直接使用共享 UIKit 的账号级头像解析：

- 优先级仍由 `getUIKitAvatarUri` 统一处理。
- 这样列表会自动读取 `userStore.users`、`friendStore.friends` 等最新来源中的头像。
- 好友卡片返回后，只要云端资料已写入 store，列表重新渲染时就会显示最新头像。

## Non-Goals

- 不调整通讯录列表昵称优先级。
- 不改好友卡片页面的数据拉取策略。
- 不扩展到其它列表页，除非后续发现同类问题。
