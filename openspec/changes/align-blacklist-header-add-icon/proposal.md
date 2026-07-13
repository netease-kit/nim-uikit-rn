## Why

黑名单页面头部右上角的添加入口当前使用了不同于通讯录页的图标与点击区域样式，导致同类入口在视觉上不一致。

## What Changes

- 将黑名单页面头部右上角添加入口改为复用通讯录页相同的添加图标。
- 同步对齐该入口的点击热区尺寸与居中布局。

## Capabilities

### Modified Capabilities

- `contacts-blacklist`: 补充黑名单页头部添加入口与通讯录页保持一致的要求。

## Impact

- 受影响代码：`app/contacts/blacklist.tsx`
- 受影响行为：黑名单页头部右上角添加入口的视觉样式与点击区域
