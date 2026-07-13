## Overview

这次只修正标记消息列表页在群消息场景下传给 UIKit 头像和称谓组件的会话上下文，不改底层称谓算法。

## Design

- 标记消息列表继续复用 `UIKitUserAvatar` 和 `UIKitAppellation`
- 当消息属于群会话时，传入正确的 `teamId`
- 依赖现有 UIKit 称谓优先级完成群昵称展示

## Risks

- 若页面继续硬编码会话类型数字，后续容易再次写反；这次先做最小修复
