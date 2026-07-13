## Overview

本次改动只调整 RN 聊天页受限相册权限下的进入路径和选择器内部扩权入口，不改变媒体发送、文件大小校验、图片/视频混选限制、视频单选限制等既有逻辑。

## Decisions

### 1. 受限权限时直接复用现有 limited media picker

- 现有 `app/chat/[id].tsx` 已经维护了受限相册专用的 `limitedMediaPickerVisible`、分页加载、缩略图缓存和发送逻辑。
- 受限权限场景不再先弹额外 `Alert`，而是直接调用 `openLimitedMediaPicker(...)`。
- 为了让选择页内部区分“普通相册进入”和“受限相册进入”，新增 `limitedMediaAccessLimited` 状态。

### 2. 扩权入口内聚到网格尾部卡片

- 受限相册页新增一个尾部虚拟 item，固定渲染为“添加更多照片”卡片。
- 点击卡片调用现有 `MediaLibrary.presentPermissionsPickerAsync(['photo', 'video'])`。
- 扩权成功后刷新权限状态和媒体列表；失败时继续沿用现有 toast 提示。
- iOS 在同一受限媒体弹窗生命周期内不会可靠地通过 `presentPermissionsPickerAsync()` 返回值直接暴露新增授权资产，因此需要订阅 `MediaLibrary.addListener()` 的媒体库变更事件；收到变更后同时重置分页、缩略图状态和列表实例，避免必须先退出弹窗再重新进入才能看到新增媒体。
- 另外，iOS 上在 limited 权限下的后续资源查询可能出现超出当前授权范围的结果。为保证聊天入口二次进入时仍只展示已授权资源，RN 需要在未触发“添加更多照片”扩权前，沿用当前已知授权资源集合作为显示范围保护。

### 3. iOS 关闭自动 limited access 提示

- 参考 iOS 原生端，在 `app.json` 的 `expo.ios.infoPlist` 中新增 `PHPhotoLibraryPreventAutomaticLimitedAccessAlert: true`。
- 这样系统不会在每次重新进入相关相册流时自动插入 limited-access 提示，由应用显式通过尾部卡片触发扩权。

## Non-Goals

- 不替换当前受限媒体网格的虚拟列表实现。
- 不改变图片/视频混选规则或选择上限。
- 不扩展到头像编辑等其他相册入口。
