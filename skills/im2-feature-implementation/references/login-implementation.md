# Login Implementation

用于回答“当前仓库里的登录类功能是怎么做的”。

## 主要落点

- 页面入口：`app/login.tsx`
- 鉴权状态：`stores/AuthStore.ts`
- NIM 初始化与登录：`stores/NIMStore.ts`
- 短信接口：`services/auth.ts`
- 运行时配置：`constants/NIMConfig.ts`
- 持久化：`utils/storage.ts`

## 当前实现套路

1. `app/login.tsx` 负责手机号、验证码、错误提示、注册确认弹窗和登录按钮态
2. `stores/AuthStore.ts` 负责手机号和验证码校验、短信倒计时、短信接口调用、登录态持久化、会话恢复、登出
3. `services/auth.ts` 负责调用用户中心短信接口，不在页面里直接写请求
4. `stores/NIMStore.ts` 负责等待 SDK ready 并执行 NIM 登录
5. 登录成功后由页面或根布局进入 `/(tabs)`

## 新增登录相关功能时的默认落点

- 表单展示、弹窗、按钮、错误文案：`app/login.tsx`
- 倒计时、校验、登录流程编排、持久化：`stores/AuthStore.ts`
- 新接口封装：`services/auth.ts`
- SDK 登录参数、环境、AppKey：`constants/NIMConfig.ts`、`stores/NIMStore.ts`

## 常见扩展点

- 新增验证码登录前置确认
- 新增登录失败错误码映射
- 新增会话恢复逻辑
- 新增登录后的待处理跳转
- 新增手机号输入约束或验证码长度约束

## 典型实现步骤

1. 先确认 UI 入口是否仍在 `app/login.tsx`
2. 再确认流程状态是否需要进入 `stores/AuthStore.ts`
3. 如果有新接口，先补 `services/auth.ts`
4. 如果影响 NIM 登录环境或 token 使用，再改 `stores/NIMStore.ts` / `constants/NIMConfig.ts`
5. 最后补登录成功、失败和会话恢复的验证

## 最少测试面

- 正常短信发送
- 倒计时期间重复获取验证码
- 手机号格式非法
- 验证码格式非法
- 首次注册确认弹窗
- 登录成功进入首页
- 登录失败错误提示
- 已保存会话自动恢复
- 退出登录后会话清理
