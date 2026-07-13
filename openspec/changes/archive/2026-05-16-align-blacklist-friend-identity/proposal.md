## Why

黑名单好友当前已经能优先显示预设头像，但 React Native 黑名单页的昵称主标题仍未统一走 UIKit 称谓规则，同时在没有头像图片时，默认头像文案回退顺序也还没有明确收敛到“备注 > 个人昵称 > accid”。这会导致黑名单页名称与默认头像字符来源不一致。

## What Changes

- 保持现有预设头像图片展示逻辑不变。
- 让黑名单页昵称主标题统一使用 UIKit 称谓规则：好友备注、好友个人昵称、`accid`。
- 统一 React Native UIKit 无头像时的默认头像字符回退顺序为：好友备注、好友个人昵称、`accid`。
- 默认头像字符继续取最终回退名称的末尾两位。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `contact-blacklist-and-teams`: 补充黑名单好友无头像时的默认头像字符回退规则。

## Impact

- Affected code: `app/contacts/blacklist.tsx`, `src/NEUIKit/rn/identity.ts`
- Affected specs: `openspec/changes/align-blacklist-friend-identity/specs/contact-blacklist-and-teams/spec.md`
- No API, dependency, or backend impact.
