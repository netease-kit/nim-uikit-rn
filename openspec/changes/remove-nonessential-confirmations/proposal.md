## Why

当前 RN 里仍有部分确认弹窗并非原始 `TestCases` 明确要求，导致交互路径比测试预期更长。按照当前仓库约定，只有 `TestCases` 明确要求的二次确认才应保留，其余都视为非必要确认并应移除。

## What Changes

- 移除验证消息页“清空”操作的确认弹窗。
- 移除黑名单页“解除”操作的确认弹窗。
- 移除聊天多选删除消息的确认弹窗。
- 移除设置页切换云端会话时的确认弹窗和附带的二次退出登录链路。
- 保留原始 `TestCases` 明确要求的确认弹窗，例如删除好友、退出/解散群聊、移除群成员、消息删除、消息撤回、转发确认、首次注册提示等。

## Capabilities

### Modified Capabilities

- `user-setting-page`: 收敛云端会话开关的交互步骤。
- `friend-verification-center`: 清空验证消息直接执行。
- `contact-blacklist-and-teams`: 解除黑名单直接执行。
- `chat-message-actions-and-receipts`: 多选删除消息直接执行。

## Impact

- 受影响代码：`app/user/setting.tsx`、`app/contacts/validlist.tsx`、`app/contacts/blacklist.tsx`、`app/chat/[id].tsx`
- 受影响行为：部分非必要确认弹窗被移除
- 无新增依赖，无协议变更
