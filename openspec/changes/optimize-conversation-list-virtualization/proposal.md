## Why

当前 RN 会话列表在数据量较大时滚动和初次渲染会变慢。页面虽然使用了 `FlatList`，但尚未针对大列表场景补齐稳定的虚拟化参数和行级渲染收敛，试点优化空间仍然明显。

## What Changes

- 仅在 RN 会话列表页试点虚拟列表优化。
- 保持当前 UI 和交互行为不变。
- 通过固定高度布局、列表窗口参数和行级稳定渲染，降低大数据量下的渲染压力。
- 在接近列表尾部时提前请求下一页会话，减少滚动到分页边界时的卡顿。

## Capabilities

### Modified Capabilities

- `conversation-list`: 在大量会话数据场景下，需要通过虚拟列表参数和稳定渲染策略提升列表性能。

## Impact

- Affected code: `app/(tabs)/index.tsx`
- Affected behavior: conversation list rendering performance in RN
- No API, dependency, or backend impact.
