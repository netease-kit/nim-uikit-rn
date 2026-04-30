# Cross Platform Adaptation

用于在没有参考项目时，先定义 IM 功能在不同端上的实现差异。

## 适用平台

- React Native / Expo
- Web / H5
- Hybrid 项目

## 平台差异总原则

- 核心业务模型保持统一
- 页面结构可以按平台变化
- store / service / domain 尽量跨端复用
- 权限、通知、文件、路由等平台差异能力通过适配层隔离

## 1. 路由差异

### React Native / Expo
- 常见方案：Expo Router、React Navigation
- 页面跳转由路由容器管理
- 返回栈和原生手势要考虑

### Web / H5
- 常见方案：React Router、Next 路由
- 依赖 URL 和浏览器历史栈
- 支持地址栏直达、刷新恢复

### 适配建议
- 抽象统一页面意图，不在业务层直接绑定某个路由库
- 页面参数读取和跳转封装在 route adapter 中

## 2. 存储差异

### React Native / Expo
- 常见方案：AsyncStorage、SecureStore

### Web / H5
- 常见方案：localStorage、IndexedDB

### 适配建议
- 统一提供 storage adapter
- 登录态、偏好设置、最近转发记录等都通过 adapter 读写
- 避免页面直接写 `localStorage` 或 `AsyncStorage`

## 3. 通知差异

### React Native / Expo
- 依赖系统通知权限
- 可能涉及前台通知展示、点击通知跳转

### Web / H5
- 浏览器通知权限能力受限
- 某些端不支持原生通知能力

### 适配建议
- 提供 notification adapter
- 对不支持的平台做降级
- 通知点击跳转逻辑不要写死在平台代码里

## 4. 文件与媒体差异

### React Native / Expo
- 文件选择、相册、相机、下载目录都要考虑权限
- 本地文件路径和系统打开能力要适配

### Web / H5
- 依赖浏览器文件选择、Blob、下载链接、预览地址
- 本地持久化能力有限

### 适配建议
- 上传前选择、下载后保存、预览都通过 file adapter 统一
- 页面只拿“可发送文件”“可预览文件”“可打开文件”结果

## 5. 权限差异

### React Native / Expo
- 相机、相册、通知、麦克风、位置等权限都要显式申请

### Web / H5
- 依赖浏览器权限模型
- 某些能力可能完全不可用或体验不一致

### 适配建议
- 统一 permission adapter
- 页面只关心 granted / denied / unavailable

## 6. 音视频与附件展示差异

### React Native / Expo
- 原生播放器、文件打开器、媒体预览体验偏原生

### Web / H5
- 更依赖浏览器播放器和新标签页能力

### 适配建议
- 消息模型统一
- 展示组件按平台替换
- 业务逻辑不绑定具体播放器实现

## 7. UI 差异

### React Native / Expo
- 列表滚动、输入框避让、手势、弹窗都要考虑移动端体验

### Web / H5
- 鼠标 hover、键盘快捷键、宽屏布局更常见

### 适配建议
- 功能路径一致，交互细节按平台增强
- 先做一致功能，再做端侧优化

## 默认跨端实现策略

建议把以下能力都做成 adapter：
- routeAdapter
- storageAdapter
- notificationAdapter
- fileAdapter
- permissionAdapter
- networkAdapter

## 最少测试面

- 登录态持久化在不同端都正确
- 通知权限在不同端都可用或正确降级
- 文件选择 / 下载在不同端都可用或正确降级
- 路由跳转和刷新恢复在不同端都正确
