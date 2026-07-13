## Why

群管理页三个权限设置项的可选值同时出现“群主/管理员”和“群主和管理员”两种表述，影响同页文案一致性。产品期望统一为“群主和管理员”。

## What Changes

- 将群管理相关权限值中的“群主/管理员”统一为“群主和管理员”。
- 英文文案同步统一为 `Owner and admins`。
- 不改变权限值、SDK 参数或设置逻辑。

## Impact

- Affects team management permission option labels and selected-value labels.
- No data model, SDK API, or permission behavior changes.
