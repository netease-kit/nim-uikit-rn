## Why

在会话列表试点后，联系人首页好友目录和两个高频选择器仍然会在数据量较大时出现渲染和滚动变慢的问题。这些页面同样依赖长列表展示，适合继续沿用相同的虚拟化优化策略。

## What Changes

- 优化联系人首页好友 `SectionList` 的虚拟化参数和行渲染稳定性。
- 优化建群选择器和邀请成员选择器两个 `FlatList` 的虚拟化参数和行渲染稳定性。
- 保持当前 UI、交互、搜索、勾选和跳转逻辑不变。

## Capabilities

### Modified Capabilities

- `contacts-home`: 好友目录在大量联系人场景下需要保持可接受的列表性能。
- `conversation-picker`: 建群联系人选择器在大量好友场景下需要保持可接受的列表性能。
- `team-member-picker`: 邀请成员选择器在大量好友场景下需要保持可接受的列表性能。

## Impact

- Affected code: `app/(tabs)/contacts.tsx`, `app/conversation/picker.tsx`, `app/team/member-picker.tsx`
- Affected behavior: contact and picker list rendering performance in RN
- No API, dependency, or backend impact.
