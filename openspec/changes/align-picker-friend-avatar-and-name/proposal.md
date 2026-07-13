## Why

会话模块测试用例 `0207-人员选择器好友头像及昵称` 要求人员选择器中的好友昵称遵循“备注 > 个人昵称 > accid”，头像优先展示预设头像，缺省时使用对应展示名的后两位字符生成默认头像。当前 React Native 的 `app/conversation/picker.tsx` 使用自绘首字母头像，没有复用 UIKit 头像链路，也没有满足默认头像字符规则，因此该用例无法通过。

## What Changes

- 让会话选择页的好友列表头像复用 UIKit 用户头像能力。
- 让会话选择页候选项显式透传好友或数字人的预设头像。
- 将 React Native UIKit 默认头像文案调整为基于展示名后两位字符生成。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话选择页好友昵称与头像展示优先级要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`、`src/NEUIKit/rn/identity.ts`
- 受影响行为：会话模块人员选择器的好友与数字人头像/昵称展示
- 无新增依赖，无接口协议变更
