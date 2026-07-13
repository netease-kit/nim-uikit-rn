## Why

开发 IM UIKit 行为时，经常需要参考 Web、Android、iOS 已有实现。当前 `AGENTS.md` 没有明确这些本地参考仓库路径和默认分支，导致 agent 需要临时询问或自行猜测参考来源。

## What Changes

- 在 `AGENTS.md` 中新增参考实现说明。
- 明确 Web（React/Vue/Web/H5）、Android、iOS 三端本地仓库路径。
- 明确默认参考分支为 `master`，除非任务另有说明。

## Impact

- Affected docs: `AGENTS.md`
- Affected workflow: agent 在对齐 IM UIKit 行为时可直接查阅指定参考实现。
