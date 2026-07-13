## Why

通讯录首页当前会在快捷入口下方展示“好友xx位·群xx个”的数量汇总文案。该信息不是必要内容，还会增加页面噪音。当前需求要求直接移除此汇总展示。

## What Changes

- 移除通讯录首页快捷入口下方的好友/群数量汇总文案。
- 保留快捷入口、好友目录、字母索引和其他通讯录能力不变。

## Capabilities

### Modified Capabilities

- `contacts-home`: 通讯录首页不再展示好友数和群数汇总文案。

## Impact

- Affected code: `app/(tabs)/contacts.tsx`
- Affected behavior: contacts home header no longer shows summary counts
- No API or dependency changes.
