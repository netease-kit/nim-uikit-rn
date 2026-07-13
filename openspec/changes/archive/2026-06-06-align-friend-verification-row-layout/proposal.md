## Why

收到好友验证消息后，RN 验证消息列表把申请内容拼成一行展示，长昵称或长附言会挤占右侧“拒绝 / 同意”按钮空间，且不符合 Figma 与 UIKit 的“头像 + 名称 + 申请动作”两行结构。

## What Changes

- 好友验证消息行改为固定头像、两行文案和固定右侧操作区。
- 第一行展示申请人昵称，超长时单行省略。
- 第二行展示“申请添加为好友”。
- 拒绝、同意按钮保持完整显示，不被昵称或申请内容挤压。

## Capabilities

### Modified Capabilities

- `contacts-valid-list`: 验证消息列表好友申请行布局。

## Impact

- 受影响代码：`app/contacts/validlist.tsx`、`utils/app-language.ts`
- 受影响行为：通讯录验证消息列表的好友申请行展示
- 不影响好友申请拉取、同意、拒绝和未读数逻辑
