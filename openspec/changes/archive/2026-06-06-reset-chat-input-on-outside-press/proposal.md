# Proposal

## Why

当前 RN 聊天详情页只有语音输入态支持点击消息区域后回到文本输入。表情面板、更多面板和键盘态下，点击输入模块以外区域的收起行为不一致。

## What Changes

- 聊天详情页点击输入模块以外区域时，统一切换回文本输入模式。
- 同时收起系统键盘、表情面板和更多面板。
- 保留录音中的按住说话流程，避免外部点击误中断正在进行的录音。
- 记录本仓库固定使用 Metro `8081` 的开发约定，已有服务运行时通过热更新到真机，不在每次修复后重启 8081。

## Capabilities

### Modified Capabilities

- `chat-detail`: 聊天页输入模块外点击需要统一复位输入态并收起键盘/面板。
- `agent-workflow`: 本地开发固定使用 8081，修复后优先热更新到真机。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected docs: `AGENTS.md`
- Affected behavior: chat detail composer dismissal across text, voice, emoji, and more-panel modes
- No API, dependency, or backend impact.
