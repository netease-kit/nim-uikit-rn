## Why

个人信息页当前通过手动输入文本来设置生日，交互容易输错，也无法满足“生日设置需要通过日期组件设置”的要求。生日属于结构化日期字段，应该通过明确的日期选择交互产生合法值。

## What Changes

- 将个人信息页的生日编辑从文本输入改为日期选择组件。
- 保持生日保存值为 `YYYY-MM-DD`，并限制可选日期不晚于当天。
- 为个人信息页补充生日选择交互要求，避免再次回退到自由文本输入。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 补充个人信息页生日字段必须通过日期选择交互设置的要求。

## Impact

- 受影响代码：`app/user/my-detail.tsx`
- 受影响行为：个人信息页生日编辑交互与保存前校验
- 无新增依赖，无 API 变化
