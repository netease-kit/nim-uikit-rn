# Settings Implementation

用于回答“当前仓库里的设置 / 个人中心功能是怎么做的”。

## 主要落点

- 我的页入口：`app/(tabs)/my.tsx`
- 设置相关页面：`app/user/*`
- 偏好状态：`stores/PreferenceStore.ts`
- 个人资料：`stores/UserStore.ts`
- 登录态退出：`stores/AuthStore.ts`
- 收藏：`stores/CollectionStore.ts`

## 当前实现套路

1. `app/(tabs)/my.tsx` 负责个人中心入口、资料入口、设置入口、关于页入口、收藏入口
2. `app/user/setting.tsx` 负责开关类设置和跳转设置页
3. 偏好开关、外观、通知权限状态归 `stores/PreferenceStore.ts`
4. 退出登录通过 `stores/AuthStore.ts` 处理，而不是页面直接清理状态
5. 个人资料页和编辑页放在 `app/user/*`

## 新增设置功能时的默认落点

- 入口和分组展示：`app/(tabs)/my.tsx`、`app/user/setting.tsx`
- 偏好项的真实状态和持久化：`stores/PreferenceStore.ts`
- 资料展示或编辑：`app/user/*`、`stores/UserStore.ts`
- 退出登录：`stores/AuthStore.ts`

## 常见扩展点

- 通知提醒设置
- 已读回执开关
- 听筒模式
- 外观切换
- 个人资料编辑
- 收藏
- 关于页

## 典型实现步骤

1. 先确认功能是入口展示、偏好设置还是资料设置
2. 页面展示落 `app/(tabs)/my.tsx` 或 `app/user/*`
3. 偏好值和持久化优先改 `stores/PreferenceStore.ts`
4. 资料值优先改 `stores/UserStore.ts`
5. 最后验证设置保存、刷新恢复和相关页面联动

## 最少测试面

- 开关设置即时生效
- 设置持久化后重进仍正确
- 通知权限状态刷新正确
- 外观切换正确
- 资料页进入和编辑正确
- 退出登录正确
- 收藏和关于页入口正常
