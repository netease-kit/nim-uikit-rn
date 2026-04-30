# IM Architecture Blueprint

当项目还没有稳定结构时，优先使用这个蓝图。

## 推荐工程分层

### app / screens
- 路由和页面入口
- 只负责展示、交互编排、导航、参数读取

### stores / state
- 负责业务状态
- 负责异步动作调度
- 负责列表和详情联动

### services
- 负责接口请求或 SDK 调用封装
- 不在页面中直接散落底层调用

### domain / models
- 存放核心实体定义
- 存放状态枚举和契约

### utils
- 网络、权限、文件、时间格式化、消息辅助处理等无页面归属逻辑

### constants / config
- AppKey、环境配置、静态常量、开关项

## 推荐最小目录

```text
app/
  login/
  conversations/
  chat/
  contacts/
  teams/
  settings/
stores/
services/
domain/
utils/
constants/
```

## 模块边界原则

- 页面不直接长期持有业务状态
- 状态层不直接决定路由结构
- 服务层不关心 UI 呈现
- 数据模型要先于复杂交互确定

## MVP 顺序

1. 登录
2. 会话列表
3. 聊天详情
4. 联系人
5. 群组
6. 设置
